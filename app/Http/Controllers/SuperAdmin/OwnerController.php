<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OwnerController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::with('tenants')
            ->whereIn('role', ['owner', 'inactive'])
            ->when($request->search, function ($q, $search) {
                $q->where(function ($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->status, function ($q, $status) {
                if ($status === 'active') {
                    $q->where('role', 'owner');
                } elseif ($status === 'inactive') {
                    $q->where('role', 'inactive');
                }
            });

        $owners = $query->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        $owners->getCollection()->transform(fn (User $owner) => [
            'id' => $owner->id,
            'name' => $owner->name,
            'email' => $owner->email,
            'role' => $owner->role,
            'created_at' => $owner->created_at,
            'tenant' => $owner->tenants->first()
                ? [
                    'id' => $owner->tenants->first()->id,
                    'name' => $owner->tenants->first()->name,
                    'slug' => $owner->tenants->first()->slug,
                ]
                : null,
        ]);

        return Inertia::render('super-admin/owners/index', [
            'owners' => $owners,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(User $owner): Response
    {
        $owner->load('tenants.subscription.plan');

        $tenant = $owner->tenants->first();
        $stats = null;

        if ($tenant) {
            $stats = [
                'total_students' => $tenant->students()->count(),
                'active_students' => $tenant->students()->where('status', 'active')->count(),
                'total_batches' => $tenant->batches()->count(),
                'total_users' => $tenant->users()->count(),
                'total_payments' => $tenant->subscription ? $tenant->subscription->payments()->where('status', 'success')->count() : 0,
                'total_spent' => (float) ($tenant->subscription ? $tenant->subscription->payments()->where('status', 'success')->sum('amount') : 0),
            ];
        }

        $plans = Plan::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('super-admin/owners/show', [
            'owner' => [
                'id' => $owner->id,
                'name' => $owner->name,
                'email' => $owner->email,
                'phone' => $owner->phone,
                'role' => $owner->role,
                'created_at' => $owner->created_at,
                'tenant' => $tenant ? [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                    'email' => $tenant->email,
                    'phone' => $tenant->phone,
                    'is_active' => $tenant->is_active,
                    'subscription' => $tenant->subscription ? [
                        'id' => $tenant->subscription->id,
                        'status' => $tenant->subscription->status,
                        'billing_type' => $tenant->subscription->billing_type,
                        'trial_ends_at' => $tenant->subscription->trial_ends_at,
                        'ends_at' => $tenant->subscription->ends_at,
                        'plan' => $tenant->subscription->plan ? [
                            'id' => $tenant->subscription->plan->id,
                            'name' => $tenant->subscription->plan->name,
                            'price_monthly' => $tenant->subscription->plan->price_monthly,
                            'price_yearly' => $tenant->subscription->plan->price_yearly,
                            'max_students' => $tenant->subscription->plan->max_students,
                            'max_staff' => $tenant->subscription->plan->max_staff,
                            'max_batches' => $tenant->subscription->plan->max_batches,
                            'features' => $tenant->subscription->plan->features,
                        ] : null,
                    ] : null,
                ] : null,
            ],
            'stats' => $stats,
            'plans' => $plans->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'price_monthly' => $p->price_monthly,
                'price_yearly' => $p->price_yearly,
                'max_students' => $p->max_students,
                'max_staff' => $p->max_staff,
                'max_batches' => $p->max_batches,
                'features' => $p->features,
            ]),
        ]);
    }

    public function toggleActive(User $owner)
    {
        $isActive = $owner->role !== 'owner';

        $owner->update([
            'role' => $isActive ? 'owner' : 'inactive',
        ]);

        if ($owner->tenants->first()) {
            $owner->tenants->first()->update(['is_active' => $isActive]);
        }

        return redirect()->back()->with('toast', [
            'type' => 'success',
            'message' => $isActive
                ? 'Owner activated successfully.'
                : 'Owner deactivated successfully.',
        ]);
    }

    public function assignPlan(Request $request, User $owner)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
        ]);

        $tenant = $owner->tenants->first();
        if (! $tenant) {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'Owner has no coaching center.',
            ]);
        }

        $plan = Plan::findOrFail($validated['plan_id']);

        $subscription = $tenant->subscription;
        if ($subscription) {
            $subscription->update([
                'plan_id' => $plan->id,
                'status' => 'active',
                'ends_at' => now()->addMonth(),
                'trial_ends_at' => null,
            ]);
        } else {
            $tenant->subscription()->create([
                'plan_id' => $plan->id,
                'status' => 'active',
                'ends_at' => now()->addMonth(),
            ]);
        }

        return redirect()->back()->with('toast', [
            'type' => 'success',
            'message' => "Plan changed to {$plan->name} successfully.",
        ]);
    }
}
