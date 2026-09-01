<?php

namespace App\Http\Responses;

use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Fortify;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            return response()->json(['two_factor' => false]);
        }

        $user = $request->user();

        if (method_exists($user, 'isParent') && $user->isParent()) {
            return redirect()->intended('/portal');
        }

        return redirect()->intended(Fortify::redirects('login'));
    }
}
