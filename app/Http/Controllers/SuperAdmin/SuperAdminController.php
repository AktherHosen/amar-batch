<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\SubscriptionHistory;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminController extends Controller
{
    public function dashboard(): Response
    {
        $stats = [
            'total_tenants' => Tenant::count(),
            'active_tenants' => Tenant::where('is_active', true)->count(),
            'total_users' => User::count(),
            'total_revenue' => (float) Payment::where('status', 'success')->sum('amount'),
            'active_subscriptions' => Subscription::where('status', 'active')->count(),
            'trial_subscriptions' => Subscription::where('status', 'trial')->count(),
            'pending_payments' => Payment::where('status', 'pending')->count(),
            'total_students' => \App\Models\Student::count(),
        ];

        $recentPayments = Payment::with(['tenant', 'plan'])
            ->latest()
            ->take(10)
            ->get();

        $ownerActivity = User::where('role', 'owner')
            ->with('tenants')
            ->whereIn('id', function ($query) {
                $query->select('user_id')
                    ->from('sessions')
                    ->where('last_activity', '>', now()->subDays(30)->timestamp)
                    ->groupBy('user_id');
            })
            ->latest('updated_at')
            ->take(5)
            ->get()
            ->map(function ($user) {
                $lastSession = DB::table('sessions')
                    ->where('user_id', $user->id)
                    ->where('last_activity', '>', now()->subDays(30)->timestamp)
                    ->orderByDesc('last_activity')
                    ->first();

                $tenant = $user->tenants->first();

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'tenant' => $tenant ? ['id' => $tenant->id, 'name' => $tenant->name] : null,
                    'last_login_at' => $lastSession ? \Carbon\Carbon::createFromTimestamp($lastSession->last_activity)->diffForHumans() : null,
                    'last_activity' => $lastSession ? \Carbon\Carbon::createFromTimestamp($lastSession->last_activity)->toISOString() : null,
                ];
            });

        $recentTenants = Tenant::with('subscription.plan')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($tenant) => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'is_active' => $tenant->is_active,
                'created_at' => $tenant->created_at->diffForHumans(),
                'plan' => $tenant->subscription?->plan?->name ?? 'No plan',
                'status' => $tenant->subscription?->status ?? 'none',
            ]);

        $revenueTrend = collect(range(11, 0))->map(function ($i) {
            $date = now()->subMonths($i);
            return [
                'month' => $date->format('M Y'),
                'revenue' => (float) Payment::where('status', 'success')
                    ->whereMonth('paid_at', $date->month)
                    ->whereYear('paid_at', $date->year)
                    ->sum('amount'),
            ];
        });

        $planDistribution = Subscription::where('status', 'active')
            ->join('plans', 'subscriptions.plan_id', '=', 'plans.id')
            ->select('plans.name', DB::raw('count(*) as count'))
            ->groupBy('plans.name')
            ->get()
            ->pluck('count', 'name')
            ->toArray();

        return Inertia::render('super-admin/dashboard', [
            'stats' => $stats,
            'recentPayments' => $recentPayments,
            'ownerActivity' => $ownerActivity,
            'recentTenants' => $recentTenants,
            'revenueTrend' => $revenueTrend,
            'planDistribution' => $planDistribution,
        ]);
    }

    public function payments(Request $request): Response
    {
        $query = Payment::with(['tenant', 'plan']);

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('method') && $request->method !== 'all') {
            if ($request->method === 'manual') {
                $query->where('payment_method', 'manual');
            } elseif ($request->method === 'gateway') {
                $query->whereNull('payment_method')->orWhere('payment_method', '!=', 'manual');
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('tenant', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                ->orWhere('txid', 'like', "%{$search}%");
        }

        $payments = $query->latest()->paginate(10)->withQueryString();

        $stats = [
            'total' => Payment::count(),
            'successful' => Payment::where('status', 'success')->count(),
            'pending' => Payment::where('status', 'pending')->count(),
            'failed' => Payment::where('status', 'failed')->count(),
            'cancelled' => Payment::where('status', 'cancelled')->count(),
            'total_revenue' => (float) Payment::where('status', 'success')->sum('amount'),
        ];

        return Inertia::render('super-admin/payments', [
            'payments' => $payments,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search', 'method']),
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

    public function rejectPayment(Payment $payment): \Illuminate\Http\RedirectResponse
    {
        if ($payment->payment_method !== 'manual' || $payment->status !== 'pending') {
            return back()->withErrors(['error' => 'Invalid payment.']);
        }

        $payment->update(['status' => 'failed']);

        return back()->with('success', 'Payment rejected.');
    }

    public function showTenant(Tenant $tenant): Response
    {
        $tenant->load('subscription.plan');

        $payments = Payment::where('tenant_id', $tenant->id)
            ->with('plan')
            ->latest()
            ->paginate(10)
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
            'users_count' => \App\Models\User::whereHas('tenants', fn ($q) => $q->where('tenants.id', $tenant->id))->count(),
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

        $subscription = $tenant->subscription;
        $oldPlan = $subscription?->plan;

        if ($subscription) {
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
                'ends_at' => $payment->billing_type === 'yearly' ? now()->addYear() : now()->addMonth(),
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
}
