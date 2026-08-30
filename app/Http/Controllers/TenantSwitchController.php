<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TenantSwitchController extends Controller
{
    public function show(Request $request): Response
    {
        $user = $request->user();
        $tenants = $user->tenants()->get(['tenants.id', 'tenants.name', 'tenants.slug', 'tenants.logo', 'tenants.is_active'])
            ->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'slug' => $t->slug,
                'logo' => $t->logo,
                'is_active' => $t->is_active,
                'role' => $t->pivot->role,
            ]);

        // If only one tenant, auto-select
        if ($tenants->count() === 1) {
            $request->session()->put('active_tenant_id', $tenants->first()->id);

            return to_route('dashboard');
        }

        return Inertia::render('select-tenant', [
            'tenants' => $tenants,
        ]);
    }

    public function switch(Request $request, Tenant $tenant): RedirectResponse
    {
        $user = $request->user();

        if (! $user->belongsToTenant($tenant->id)) {
            abort(403, 'You do not belong to this coaching center.');
        }

        if (! $tenant->is_active) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'This coaching center is inactive.',
            ]);
        }

        $request->session()->put('active_tenant_id', $tenant->id);

        return to_route('dashboard')->with('toast', [
            'type' => 'success',
            'message' => "Switched to {$tenant->name}.",
        ]);
    }
}
