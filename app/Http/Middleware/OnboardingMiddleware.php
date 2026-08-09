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

        if (!$user) {
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
        if ($user->isOwner() && !$user->onboarding_complete) {
            if ($request->routeIs('onboarding.*')) {
                return $next($request);
            }

            return redirect()->route('onboarding.show');
        }

        return $next($request);
    }
}
