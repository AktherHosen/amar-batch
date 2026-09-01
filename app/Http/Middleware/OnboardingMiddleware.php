<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OnboardingMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect('/login');
        }

        // Super admin doesn't need onboarding
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        // Staff don't need onboarding
        if ($user->isStaff()) {
            return $next($request);
        }

        // Owner needs onboarding if not complete
        if ($user->isOwner() && ! $user->onboarding_complete) {
            if ($request->routeIs('onboarding.*')) {
                return $next($request);
            }

            return redirect()->route('onboarding.show');
        }

        // Check for expired subscriptions (skip for payment/subscription routes)
        if ($user->isOwner() && $user->current_tenant && ! $request->routeIs('payment.*') && ! $request->routeIs('subscription.*')) {
            $subscription = $user->current_tenant->subscription;

            if ($subscription && $subscription->isExpired()) {
                return redirect()->route('subscription.index')->with('toast', [
                    'type' => 'warning',
                    'message' => 'Your subscription has expired. Please renew to continue.',
                ]);
            }
        }

        return $next($request);
    }
}
