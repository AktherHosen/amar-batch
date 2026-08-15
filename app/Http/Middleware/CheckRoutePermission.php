<?php

namespace App\Http\Middleware;

use App\Models\Role;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class CheckRoutePermission
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Super admin and owners bypass route-level role checks.
        if ($user->isSuperAdmin() || $user->isOwner()) {
            return $next($request);
        }

        $routeName = $request->route()?->getName();

        if (! $routeName) {
            return $next($request);
        }

        if ($this->matchesAny($routeName, config('role-routes.always_allowed', []))) {
            return $next($request);
        }

        $role = Role::query()
            ->where('slug', $user->role)
            ->first();

        // Unknown role for the tenant: deny access.
        if (! $role) {
            abort(403, 'Unauthorized.');
        }

        if ($role->hasRoute($routeName)) {
            return $next($request);
        }

        abort(403, 'Unauthorized.');
    }

    /** @param array<string> $patterns */
    private function matchesAny(string $routeName, array $patterns): bool
    {
        foreach ($patterns as $pattern) {
            if (Str::is($pattern, $routeName)) {
                return true;
            }
        }

        return false;
    }
}