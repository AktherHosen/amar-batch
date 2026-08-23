<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminController extends Controller
{
    public function dashboard(): Response
    {
        $stats = [
            'total_tenants' => Tenant::count(),
            'active_tenants' => Tenant::where('is_active', true)->count(),
            'total_users' => \App\Models\User::count(),
            'total_revenue' => (float) Payment::where('status', 'success')->sum('amount'),
            'active_subscriptions' => Subscription::where('status', 'active')->count(),
            'trial_subscriptions' => Subscription::where('status', 'trial')->count(),
        ];

        $tenantStats = Tenant::withCount('students')
            ->with('subscription.plan')
            ->latest()
            ->take(5)
            ->get();

        $recentPayments = Payment::with(['tenant', 'plan'])
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('super-admin/dashboard', [
            'stats' => $stats,
            'tenantStats' => $tenantStats,
            'recentPayments' => $recentPayments,
        ]);
    }

    public function payments(Request $request): Response
    {
        $query = Payment::with(['tenant', 'plan']);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('tenant', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                ->orWhere('txid', 'like', "%{$search}%");
        }

        $payments = $query->latest()->paginate(15)->withQueryString();

        $stats = [
            'total' => Payment::count(),
            'successful' => Payment::where('status', 'success')->count(),
            'pending' => Payment::where('status', 'pending')->count(),
            'failed' => Payment::where('status', 'failed')->count(),
            'total_revenue' => (float) Payment::where('status', 'success')->sum('amount'),
        ];

        return Inertia::render('super-admin/payments', [
            'payments' => $payments,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function approvePayment(Payment $payment): \Illuminate\Http\RedirectResponse
    {
        if ($payment->status !== 'pending') {
            return back()->withErrors(['error' => 'Only pending payments can be approved.']);
        }

        $payment->update([
            'status' => 'success',
            'paid_at' => now(),
        ]);

        $this->activateSubscription($payment);

        return back()->with('success', 'Payment approved and subscription activated.');
    }

    public function cancelPayment(Payment $payment): \Illuminate\Http\RedirectResponse
    {
        if ($payment->status !== 'pending') {
            return back()->withErrors(['error' => 'Only pending payments can be cancelled.']);
        }

        $payment->update(['status' => 'cancelled']);

        return back()->with('success', 'Payment cancelled.');
    }

    public function showTenant(Tenant $tenant): Response
    {
        $tenant->load('subscription.plan');

        $payments = Payment::where('tenant_id', $tenant->id)
            ->with('plan')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $subscriptionHistory = Subscription::where('tenant_id', $tenant->id)
            ->with('plan')
            ->latest()
            ->get();

        $stats = [
            'total_payments' => Payment::where('tenant_id', $tenant->id)->count(),
            'successful_payments' => Payment::where('tenant_id', $tenant->id)->where('status', 'success')->count(),
            'total_spent' => (float) Payment::where('tenant_id', $tenant->id)->where('status', 'success')->sum('amount'),
            'pending_payments' => Payment::where('tenant_id', $tenant->id)->where('status', 'pending')->count(),
            'students_count' => \App\Models\Student::where('tenant_id', $tenant->id)->count(),
            'active_students_count' => \App\Models\Student::where('tenant_id', $tenant->id)->where('status', 'active')->count(),
            'batches_count' => \App\Models\Batch::where('tenant_id', $tenant->id)->count(),
            'active_batches_count' => \App\Models\Batch::where('tenant_id', $tenant->id)->where('status', 'active')->count(),
            'users_count' => \App\Models\User::where('tenant_id', $tenant->id)->count(),
            'total_enrollments' => \App\Models\Enrollment::where('tenant_id', $tenant->id)->count(),
        ];

        return Inertia::render('super-admin/tenant-detail', [
            'tenant' => $tenant,
            'payments' => $payments,
            'subscriptionHistory' => $subscriptionHistory,
            'stats' => $stats,
        ]);
    }

    private function activateSubscription(Payment $payment): void
    {
        $tenant = $payment->tenant;
        $plan = $payment->plan;

        if (! $tenant || ! $plan) {
            return;
        }

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
