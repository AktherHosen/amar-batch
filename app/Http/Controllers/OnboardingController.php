<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\SubscriptionHistory;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->onboarding_complete) {
            return to_route('dashboard');
        }

        return Inertia::render('onboarding/show');
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->onboarding_complete) {
            return to_route('dashboard');
        }

        $validated = $request->validate([
            'coaching_name' => ['required', 'string', 'max:255'],
            'coaching_email' => ['nullable', 'string', 'email', 'max:255'],
            'coaching_phone' => ['nullable', 'string', 'max:20'],
        ]);

        $tenant = Tenant::create([
            'name' => $validated['coaching_name'],
            'slug' => Str::slug($validated['coaching_name']),
            'email' => $validated['coaching_email'] ?? $user->email,
            'phone' => $validated['coaching_phone'] ?? null,
            'is_active' => true,
        ]);

        // Assign default plan
        $defaultPlan = Plan::where('is_default', true)->first();
        if ($defaultPlan) {
            $subscription = Subscription::create([
                'tenant_id' => $tenant->id,
                'plan_id' => $defaultPlan->id,
                'status' => 'trial',
                'trial_ends_at' => now()->addDays(14),
            ]);

            SubscriptionHistory::create([
                'tenant_id' => $tenant->id,
                'subscription_id' => $subscription->id,
                'plan_id' => $defaultPlan->id,
                'action' => 'trial_started',
                'status' => 'trial',
                'new_plan_name' => $defaultPlan->name,
            ]);
        }

        // Link user to tenant via pivot
        $user->tenants()->attach($tenant->id, ['role' => 'owner']);
        $user->update(['onboarding_complete' => true]);

        // Set active tenant in session
        $request->session()->put('active_tenant_id', $tenant->id);

        \App\Support\DefaultRoles::createForTenant($tenant->id);

        return to_route('dashboard')->with('toast', ['type' => 'success', 'message' => 'Coaching center created successfully!']);
    }
}
