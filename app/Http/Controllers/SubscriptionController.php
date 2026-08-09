<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenant = $user->tenant;

        if (! $tenant) {
            return to_route('dashboard');
        }

        $subscription = $tenant->subscription;
        $plans = Plan::where('is_active', true)->orderBy('price_monthly')->get();

        $currentUsage = [
            'students' => $tenant->students()->where('status', 'active')->count(),
            'staff' => $tenant->users()->where('role', 'staff')->count(),
            'batches' => $tenant->batches()->count(),
        ];

        $recentPayments = Payment::where('tenant_id', $tenant->id)
            ->with('plan:id,name')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Payment $p) => [
                'id' => $p->id,
                'amount' => $p->amount,
                'status' => $p->status,
                'billing_type' => $p->billing_type,
                'plan' => $p->plan?->name,
                'paid_at' => $p->paid_at,
            ]);

        return Inertia::render('settings/subscription', [
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'status' => $subscription->status,
                'billing_type' => $subscription->billing_type,
                'trial_ends_at' => $subscription->trial_ends_at,
                'ends_at' => $subscription->ends_at,
                'plan' => $subscription->plan ? [
                    'id' => $subscription->plan->id,
                    'name' => $subscription->plan->name,
                    'price_monthly' => $subscription->plan->price_monthly,
                    'price_yearly' => $subscription->plan->price_yearly,
                    'max_students' => $subscription->plan->max_students,
                    'max_staff' => $subscription->plan->max_staff,
                    'max_batches' => $subscription->plan->max_batches,
                    'features' => $subscription->plan->features,
                ] : null,
            ] : null,
            'plans' => $plans->map(fn (Plan $plan) => [
                'id' => $plan->id,
                'name' => $plan->name,
                'description' => $plan->description,
                'slug' => $plan->slug,
                'price_monthly' => $plan->price_monthly,
                'price_yearly' => $plan->price_yearly,
                'max_students' => $plan->max_students,
                'max_staff' => $plan->max_staff,
                'max_batches' => $plan->max_batches,
                'features' => $plan->features,
                'is_default' => $plan->is_default,
            ]),
            'currentUsage' => $currentUsage,
            'recentPayments' => $recentPayments,
        ]);
    }

    public function upgrade(Request $request, Plan $plan): RedirectResponse
    {
        $user = $request->user();
        $tenant = $user->tenant;

        if (! $tenant) {
            return back()->withErrors(['error' => 'No coaching center found.']);
        }

        if ($plan->price_monthly > 0) {
            return to_route('payment.initiate', ['plan' => $plan->id, 'billing' => $request->input('billing', 'monthly')]);
        }

        $subscription = $tenant->subscription;

        if ($subscription) {
            $subscription->update([
                'plan_id' => $plan->id,
                'status' => 'active',
                'trial_ends_at' => null,
                'ends_at' => null,
            ]);
        } else {
            Subscription::create([
                'tenant_id' => $tenant->id,
                'plan_id' => $plan->id,
                'status' => 'active',
            ]);
        }

        return back()->with('toast', ['type' => 'success', 'message' => "Switched to {$plan->name} successfully."]);
    }
}
