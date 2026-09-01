<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPlanFeature
{
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        $tenant = app('tenant');
        if (! $tenant) {
            return redirect()->route('dashboard');
        }

        $plan = $tenant->subscription?->plan;
        if (! $plan || ! $plan->hasFeature($feature)) {
            abort(403, 'This feature is not available on your current plan.');
        }

        return $next($request);
    }
}
