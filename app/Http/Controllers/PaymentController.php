<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Raziul\Sslcommerz\Facades\Sslcommerz;

class PaymentController extends Controller
{
    public function initiate(Request $request, Plan $plan): RedirectResponse
    {
        $user = $request->user();
        $tenant = $user->tenant;

        if (! $tenant) {
            return back()->withErrors(['error' => 'No coaching center found.']);
        }

        $billingType = $request->query('billing', 'monthly');
        $amount = $billingType === 'yearly' ? $plan->price_yearly : $plan->price_monthly;

        if ($amount <= 0) {
            return back()->withErrors(['error' => 'This plan does not require payment.']);
        }

        $invoiceId = 'AB-' . Str::upper(Str::random(8)) . '-' . time();

        $payment = Payment::create([
            'tenant_id' => $tenant->id,
            'plan_id' => $plan->id,
            'amount' => $amount,
            'billing_type' => $billingType,
            'status' => 'pending',
        ]);

        $response = Sslcommerz::setOrder($amount, $invoiceId, "{$plan->name} ({$billingType})")
            ->setCustomer(
                $tenant->name ?? $user->name,
                $user->email,
                $user->phone ?? ' ',
                $tenant->address ?? ' ',
                'Dhaka',
                ' ',
                ' ',
                'Bangladesh'
            )
            ->setShippingInfo(1, $tenant->address ?? 'Dhaka')
            ->makePayment();

        if (! $response->success()) {
            $payment->update([
                'status' => 'failed',
                'gateway_response' => $response->toArray(),
            ]);

            return back()->withErrors(['error' => 'Failed to initiate payment. Please try again.']);
        }

        $payment->update([
            'txid' => $invoiceId,
            'gateway_response' => $response->toArray(),
        ]);

        return redirect($response->gatewayPageURL());
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

        $isValid = Sslcommerz::validatePayment($data, $payment->txid, $payment->amount);

        if (! $isValid) {
            $payment->update([
                'status' => 'failed',
                'gateway_response' => $data,
            ]);

            return Inertia::render('payment/failure', [
                'message' => 'Payment validation failed.',
            ]);
        }

        $payment->update([
            'status' => 'success',
            'payment_method' => $data['card_type'] ?? $data['store_amount'] ?? null,
            'gateway_response' => $data,
            'paid_at' => now(),
        ]);

        $this->activateSubscription($payment);

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

        $isValid = Sslcommerz::validatePayment($data, $payment->txid, $payment->amount);

        if ($isValid && ($data['status'] ?? '') === 'VALID') {
            $payment->update([
                'status' => 'success',
                'payment_method' => $data['card_type'] ?? null,
                'gateway_response' => $data,
                'paid_at' => now(),
            ]);

            $this->activateSubscription($payment);

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
        $tenant = $user->tenant;

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

    private function activateSubscription(Payment $payment): void
    {
        $tenant = $payment->tenant;
        $plan = $payment->plan;

        $endsAt = $payment->billing_type === 'yearly'
            ? now()->addYear()
            : now()->addMonth();

        $subscription = $tenant->subscription;

        if ($subscription) {
            $subscription->update([
                'plan_id' => $plan->id,
                'status' => 'active',
                'billing_type' => $payment->billing_type,
                'trial_ends_at' => null,
                'ends_at' => $endsAt,
            ]);
        } else {
            Subscription::create([
                'tenant_id' => $tenant->id,
                'plan_id' => $plan->id,
                'status' => 'active',
                'billing_type' => $payment->billing_type,
                'ends_at' => $endsAt,
            ]);
        }

        $payment->update(['subscription_id' => $tenant->subscription->id]);
    }
}
