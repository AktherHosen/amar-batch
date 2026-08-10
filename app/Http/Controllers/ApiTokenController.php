<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ApiTokenController extends Controller
{
    public function index(Request $request)
    {
        $tokens = $request->user()->tokens()
            ->select('id', 'name', 'abilities', 'last_used_at', 'created_at')
            ->get();

        return inertia('settings/api', [
            'tokens' => $tokens,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $token = $request->user()->createToken(
            $validated['name'],
            ['tenant:' . $request->user()->tenant_id]
        );

        return response()->json([
            'token' => $token->plainTextToken,
            'id' => $token->accessToken->id,
            'name' => $token->accessToken->name,
            'abilities' => $token->accessToken->abilities,
            'created_at' => $token->accessToken->created_at,
        ]);
    }

    public function destroy(Request $request, $tokenId): JsonResponse
    {
        $token = $request->user()->tokens()->findOrFail($tokenId);
        $token->delete();

        return response()->json(['message' => 'Token revoked successfully.']);
    }
}
