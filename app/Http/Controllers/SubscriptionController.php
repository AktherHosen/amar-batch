<?php

namespace App\Http\Controllers;

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

        if (!$tenant) {
            return to_route('dashboard');
        }

        $subscription = $tenant->subscription;
        $plans = Plan::where('is_active', true)->orderBy('price_monthly')->get();

        $currentUsage = [
            'students' => $tenant->students()->where('status', 'active')->count(),
            'staff' => $tenant->users()->where('role', 'staff')->count(),
            'batches' => $tenant->batches()->count(),
        ];

        return Inertia::render('settings/subscription', [
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'status' => $subscription->status,
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
                'price_monthly' => $plan->price_monthly,
                'price_yearly' => $plan->price_yearly,
                'max_students' => $plan->max_students,
                'max_staff' => $plan->max_staff,
                'max_batches' => $plan->max_batches,
                'features' => $plan->features,
            ]),
            'currentUsage' => $currentUsage,
        ]);
    }

    public function upgrade(Request $request, Plan $plan): RedirectResponse
    {
        $user = $request->user();
        $tenant = $user->tenant;

        if (!$tenant) {
            return back()->withErrors(['error' => 'No coaching center found.']);
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

        return back()->with('toast', ['type' => 'success', 'message' => "Upgraded to {$plan->name} successfully."]);
    }
}
