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

        if (!$user) {
            return redirect('/login');
        }

        // Super admin doesn't need tenant context
        if ($user->role === 'super_admin') {
            App::instance('tenant_id', null);
            return $next($request);
        }

        if (!$user->tenant_id) {
            abort(403, 'No coaching center associated with your account.');
        }

        if (!$user->tenant || !$user->tenant->is_active) {
            abort(403, 'Your coaching center account is inactive.');
        }

        App::instance('tenant_id', $user->tenant_id);

        return $next($request);
    }
}
