<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckTeacherApproval
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->role === 'teacher' && !$user->is_approved) {
            return back()->with('toast', [
                'type' => 'warning',
                'message' => 'Your account is pending admin approval. Please wait for approval to access the system.',
            ]);
        }

        return $next($request);
    }
}
