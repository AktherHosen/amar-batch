<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\PaymentSetting;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentSettingController extends Controller
{
    public function index()
    {
        $setting = PaymentSetting::getForGateway('sslcommerz');

        return Inertia::render('super-admin/payment-settings', [
            'setting' => $setting,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'sandbox' => ['required', 'boolean'],
            'store_id' => ['nullable', 'string', 'max:255'],
            'store_password' => ['nullable', 'string', 'max:255'],
            'currency' => ['required', 'string', 'max:10'],
            'manual_payment_enabled' => ['required', 'boolean'],
            'manual_payment_instructions' => ['nullable', 'string'],
        ]);

        $setting = PaymentSetting::getForGateway('sslcommerz');
        $setting->update($validated);

        return back()->with('success', 'Payment settings updated.');
    }

    public function manualPayments()
    {
        $payments = Payment::where('payment_method', 'manual')
            ->with('tenant', 'plan')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $stats = [
            'total' => Payment::where('payment_method', 'manual')->count(),
            'pending' => Payment::where('payment_method', 'manual')->where('status', 'pending')->count(),
            'approved' => Payment::where('payment_method', 'manual')->where('status', 'success')->count(),
            'rejected' => Payment::where('payment_method', 'manual')->where('status', 'failed')->count(),
        ];

        return Inertia::render('super-admin/manual-payments', [
            'payments' => $payments,
            'stats' => $stats,
        ]);
    }

    public function approveManualPayment(Payment $payment)
    {
        if ($payment->payment_method !== 'manual' || $payment->status !== 'pending') {
            return back()->withErrors(['error' => 'Invalid payment.']);
        }

        $payment->update([
            'status' => 'success',
            'paid_at' => now(),
        ]);

        $this->activateSubscription($payment);

        return back()->with('success', 'Payment approved and subscription activated.');
    }

    public function rejectManualPayment(Payment $payment)
    {
        if ($payment->payment_method !== 'manual' || $payment->status !== 'pending') {
            return back()->withErrors(['error' => 'Invalid payment.']);
        }

        $payment->update(['status' => 'failed']);

        return back()->with('success', 'Payment rejected.');
    }

    private function activateSubscription(Payment $payment): void
    {
        $tenant = $payment->tenant;
        $plan = $payment->plan;

        if (!$tenant || !$plan) {
            return;
        }

        $billingType = $payment->billing_type ?? 'monthly';
        $period = $billingType === 'yearly' ? 365 : 30;
        $endsAt = now()->addDays($period);

        $subscription = Subscription::where('tenant_id', $tenant->id)->first();

        if ($subscription) {
            $baseDate = $subscription->ends_at && $subscription->ends_at->isFuture()
                ? $subscription->ends_at
                : now();

            $subscription->update([
                'plan_id' => $plan->id,
                'status' => 'active',
                'billing_type' => $billingType,
                'trial_ends_at' => null,
                'ends_at' => $baseDate->addDays($period),
            ]);
        } else {
            Subscription::create([
                'tenant_id' => $tenant->id,
                'plan_id' => $plan->id,
                'status' => 'active',
                'billing_type' => $billingType,
                'ends_at' => $endsAt,
            ]);
        }

        $payment->update(['subscription_id' => $subscription?->id ?? Subscription::where('tenant_id', $tenant->id)->latest()->first()?->id]);
    }
}
