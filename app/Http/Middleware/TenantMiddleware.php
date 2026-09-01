<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect('/login');
        }

        // Super admin doesn't need tenant context
        if ($user->isSuperAdmin()) {
            App::instance('tenant_id', null);
            App::instance('branch_id', null);

            return $next($request);
        }

        $tenants = $user->tenants;

        // No tenants at all
        if ($tenants->isEmpty()) {
            abort(403, 'No coaching center associated with your account.');
        }

        $activeTenantId = $request->session()->get('active_tenant_id');

        // Auto-select if only one tenant
        if (! $activeTenantId && $tenants->count() === 1) {
            $activeTenantId = $tenants->first()->id;
            $request->session()->put('active_tenant_id', $activeTenantId);
        }

        // No active tenant selected — redirect to picker
        if (! $activeTenantId || ! $user->belongsToTenant($activeTenantId)) {
            // Auto-select the first tenant if only one
            if ($tenants->count() === 1) {
                $activeTenantId = $tenants->first()->id;
                $request->session()->put('active_tenant_id', $activeTenantId);
            } else {
                return redirect()->route('select-tenant');
            }
        }

        $tenant = $tenants->firstWhere('id', $activeTenantId);

        if (! $tenant || ! $tenant->is_active) {
            $request->session()->forget('active_tenant_id');
            abort(403, 'Your coaching center account is inactive.');
        }

        App::instance('tenant_id', $tenant->id);

        // Branch scoping
        $branchId = null;
        if (! $user->isOwner() && ! $user->isSuperAdmin()) {
            $branchId = $user->branch_id;
        }
        App::instance('branch_id', $branchId);

        return $next($request);
    }
}
