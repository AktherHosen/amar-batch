<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\PaymentSetting;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\SubscriptionHistory;
use App\Services\SslcommerzService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    private SslcommerzService $sslcommerz;

    public function __construct(SslcommerzService $sslcommerz)
    {
        $this->sslcommerz = $sslcommerz;
    }

    public function initiate(Request $request, Plan $plan): RedirectResponse
    {
        $user = $request->user();
        $tenant = $user->current_tenant;

        if (! $tenant) {
            return back()->withErrors(['error' => 'No coaching center found.']);
        }

        $billingType = $request->query('billing', 'monthly');
        $amount = $billingType === 'yearly' ? $plan->price_yearly : $plan->price_monthly;

        if ($amount <= 0) {
            return back()->withErrors(['error' => 'This plan does not require payment.']);
        }

        $invoiceId = 'AB-'.Str::upper(Str::random(8)).'-'.time();

        $payment = Payment::create([
            'tenant_id' => $tenant->id,
            'plan_id' => $plan->id,
            'amount' => $amount,
            'billing_type' => $billingType,
            'status' => 'pending',
        ]);

        $baseUrl = $request->getSchemeAndHttpHost();

        $result = $this->sslcommerz->initiatePayment(
            amount: $amount,
            tranId: $invoiceId,
            productName: "{$plan->name} ({$billingType})",
            customerName: $tenant->name ?? $user->name,
            customerEmail: $user->email,
            customerPhone: $user->phone ?? '',
            customerAddress: $tenant->address ?? '',
            successUrl: "{$baseUrl}/payment/success",
            failUrl: "{$baseUrl}/payment/failure",
            cancelUrl: "{$baseUrl}/payment/cancel",
            ipnUrl: "{$baseUrl}/payment/ipn",
        );

        if (isset($result['status']) && $result['status'] === 'FAILED') {
            $payment->update([
                'status' => 'failed',
                'gateway_response' => $result,
            ]);

            return to_route('subscription.index')->with('error', $result['failedreason'] ?? 'Failed to initiate payment. Please try again.');
        }

        if (! isset($result['GatewayPageURL']) || empty($result['GatewayPageURL'])) {
            $payment->update([
                'status' => 'failed',
                'gateway_response' => $result,
            ]);

            return to_route('subscription.index')->with('error', 'Failed to get payment gateway URL. Please try again.');
        }

        $payment->update([
            'txid' => $invoiceId,
            'gateway_response' => $result,
        ]);

        return redirect($result['GatewayPageURL']);
    }

    public function success(Request $request): Response
    {
        $data = $request->all();

        $payment = Payment::where('txid', $data['tran_id'] ?? '')->first();

        if (! $payment) {
            return Inertia::render('payment/failure', [
                'message' => 'Payment record not found.',
            ]);
        }

        if (! isset($data['val_id']) || empty($data['val_id'])) {
            $payment->update([
                'status' => 'failed',
                'gateway_response' => $data,
            ]);

            return Inertia::render('payment/failure', [
                'message' => 'Payment validation failed: no validation ID.',
            ]);
        }

        $validation = $this->sslcommerz->validatePayment($data['val_id']);

        if (! isset($validation['status']) || strtolower($validation['status']) !== 'valid') {
            $payment->update([
                'status' => 'failed',
                'gateway_response' => $data,
            ]);

            return Inertia::render('payment/failure', [
                'message' => 'Payment validation failed.',
            ]);
        }

        if ($payment->status !== 'success') {
            $this->markPaidAndActivate($payment, $data, $validation);
        }

        return Inertia::render('payment/success', [
            'payment' => [
                'id' => $payment->id,
                'amount' => $payment->amount,
                'plan' => $payment->plan->name,
                'billing_type' => $payment->billing_type,
            ],
        ]);
    }

    public function failure(Request $request): Response
    {
        $data = $request->all();

        $payment = Payment::where('txid', $data['tran_id'] ?? '')->first();

        if ($payment) {
            $payment->update([
                'status' => 'failed',
                'gateway_response' => $data,
            ]);
        }

        return Inertia::render('payment/failure', [
            'message' => 'Payment was not completed. Please try again.',
        ]);
    }

    public function cancel(Request $request): Response
    {
        $data = $request->all();

        $payment = Payment::where('txid', $data['tran_id'] ?? '')->first();

        if ($payment) {
            $payment->update([
                'status' => 'cancelled',
                'gateway_response' => $data,
            ]);
        }

        return Inertia::render('payment/cancel', [
            'message' => 'Payment was cancelled.',
        ]);
    }

    public function ipn(Request $request): \Illuminate\Http\Response
    {
        $data = $request->all();

        $payment = Payment::where('txid', $data['tran_id'] ?? '')->first();

        if (! $payment) {
            return response('Payment not found', 404);
        }

        if (! isset($data['val_id']) || empty($data['val_id'])) {
            return response('No validation ID', 400);
        }

        $validation = $this->sslcommerz->validatePayment($data['val_id']);

        if (isset($validation['status']) && strtolower($validation['status']) === 'valid' && ($data['status'] ?? '') === 'VALID') {
            if ($payment->status !== 'success') {
                $this->markPaidAndActivate($payment, $data, $validation);
            }

            return response('OK', 200);
        }

        $payment->update([
            'status' => 'failed',
            'gateway_response' => $data,
        ]);

        return response('FAILED', 400);
    }

    public function history(Request $request): Response
    {
        $user = $request->user();
        $tenant = $user->current_tenant;

        if (! $tenant) {
            return to_route('dashboard');
        }

        $payments = Payment::where('tenant_id', $tenant->id)
            ->with('plan:id,name')
            ->latest()
            ->paginate(10);

        return Inertia::render('settings/payment-history', [
            'payments' => $payments->map(fn (Payment $p) => [
                'id' => $p->id,
                'amount' => $p->amount,
                'currency' => $p->currency,
                'status' => $p->status,
                'payment_method' => $p->payment_method,
                'billing_type' => $p->billing_type,
                'plan' => $p->plan?->name,
                'paid_at' => $p->paid_at,
                'created_at' => $p->created_at,
            ]),
        ]);
    }

    private function markPaidAndActivate(Payment $payment, array $data, array $validation): void
    {
        DB::transaction(function () use ($payment, $data, $validation): void {
            $locked = Payment::query()->withoutGlobalScopes()->lockForUpdate()->findOrFail($payment->id);

            if ($locked->status === 'success') {
                return;
            }

            $locked->update([
                'status' => 'success',
                'payment_method' => $data['card_type'] ?? null,
                'gateway_response' => array_merge($data, ['validation' => $validation]),
                'paid_at' => now(),
            ]);

            $this->activateSubscription($locked);
        });
    }

    private function activateSubscription(Payment $payment): void
    {
        $tenant = $payment->tenant;
        $plan = $payment->plan;

        $period = $payment->billing_type === 'yearly'
            ? now()->addYear()
            : now()->addMonth();

        $subscription = $tenant->subscription;
        $oldPlan = $subscription?->plan;

        if ($subscription) {
            // Extend from the current term so mid-term renewals keep paid time.
            $base = $subscription->ends_at && $subscription->ends_at->isFuture() ? $subscription->ends_at : now();
            $endsAt = $payment->billing_type === 'yearly'
                ? $base->copy()->addYear()
                : $base->copy()->addMonth();

            $subscription->update([
                'plan_id' => $plan->id,
                'status' => 'active',
                'billing_type' => $payment->billing_type,
                'trial_ends_at' => null,
                'ends_at' => $endsAt,
            ]);
        } else {
            $subscription = Subscription::create([
                'tenant_id' => $tenant->id,
                'plan_id' => $plan->id,
                'status' => 'active',
                'billing_type' => $payment->billing_type,
                'ends_at' => $period,
            ]);
        }

        $payment->update(['subscription_id' => $tenant->subscription->id]);

        $action = 'renewed';
        if (! $oldPlan) {
            $action = 'activated';
        } elseif ($plan->id !== $oldPlan->id) {
            $action = $plan->price_monthly > $oldPlan->price_monthly ? 'upgraded' : 'downgraded';
        }

        SubscriptionHistory::create([
            'tenant_id' => $tenant->id,
            'subscription_id' => $tenant->subscription->id,
            'plan_id' => $plan->id,
            'action' => $action,
            'status' => 'active',
            'billing_type' => $payment->billing_type,
            'amount' => $payment->amount,
            'old_plan_name' => $oldPlan?->name,
            'new_plan_name' => $plan->name,
        ]);
    }

    public function submitManual(Request $request, Plan $plan): RedirectResponse
    {
        $tenant = $request->user()->current_tenant;

        if (! $tenant) {
            return back()->withErrors(['error' => 'No coaching center found.']);
        }

        $setting = PaymentSetting::getForGateway('sslcommerz');

        if (! $setting->manual_payment_enabled) {
            return back()->withErrors(['error' => 'Manual payments are currently disabled.']);
        }

        $billingType = $request->query('billing', 'monthly');
        $amount = $billingType === 'yearly' ? $plan->price_yearly : $plan->price_monthly;

        if ($amount <= 0) {
            return back()->withErrors(['error' => 'This plan does not require payment.']);
        }

        $validated = $request->validate([
            'transaction_id' => ['required', 'string', 'max:255'],
            'sender_number' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $payment = Payment::create([
            'tenant_id' => $tenant->id,
            'plan_id' => $plan->id,
            'amount' => $amount,
            'billing_type' => $billingType,
            'status' => 'pending',
            'payment_method' => 'manual',
            'txid' => 'MANUAL-'.Str::upper(Str::random(8)).'-'.time(),
            'gateway_response' => [
                'transaction_id' => $validated['transaction_id'],
                'sender_number' => $validated['sender_number'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'submitted_at' => now()->toISOString(),
            ],
        ]);

        return redirect()->route('subscription.index')
            ->with('success', 'Manual payment submitted. It will be reviewed by our team shortly.');
    }
}
