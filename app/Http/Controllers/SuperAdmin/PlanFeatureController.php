<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\PlanFeature;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PlanFeatureController extends Controller
{
    public function index(): JsonResponse
    {
        $features = PlanFeature::orderBy('name')->get();

        return response()->json($features);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $validated['slug'] = PlanFeature::generateSlug($validated['name']);

        if (PlanFeature::where('slug', $validated['slug'])->exists()) {
            return response()->json(['message' => 'A feature with this name already exists.'], 422);
        }

        $feature = PlanFeature::create($validated);

        return response()->json($feature, 201);
    }

    public function update(Request $request, PlanFeature $planFeature): JsonResponse
    {
        if ($planFeature->is_system) {
            return response()->json(['message' => 'System features cannot be renamed.'], 422);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $newSlug = PlanFeature::generateSlug($validated['name']);

        if ($newSlug !== $planFeature->slug && PlanFeature::where('slug', $newSlug)->exists()) {
            return response()->json(['message' => 'A feature with this name already exists.'], 422);
        }

        $validated['slug'] = $newSlug;
        $planFeature->update($validated);

        return response()->json($planFeature);
    }

    public function destroy(PlanFeature $planFeature): JsonResponse
    {
        if ($planFeature->is_system) {
            return response()->json(['message' => 'System features cannot be deleted.'], 422);
        }

        $planFeature->delete();

        return response()->json(['message' => 'Feature deleted.']);
    }
}
