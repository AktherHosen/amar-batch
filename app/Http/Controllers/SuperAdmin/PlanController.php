<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Plan::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $plans = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('super-admin/plans/index', [
            'plans' => $plans,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:plans,slug',
            'description' => 'nullable|string',
            'price_monthly' => 'required|numeric|min:0',
            'price_yearly' => 'required|numeric|min:0',
            'max_students' => 'required|integer|-1|min:-1',
            'max_staff' => 'required|integer|-1|min:-1',
            'max_batches' => 'required|integer|-1|min:-1',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
        ]);

        Plan::create($validated);

        return to_route('super-admin.plans.index')
            ->with('toast', ['type' => 'success', 'message' => 'Plan created successfully.']);
    }

    public function update(Request $request, Plan $plan): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:plans,slug,'.$plan->id,
            'description' => 'nullable|string',
            'price_monthly' => 'required|numeric|min:0',
            'price_yearly' => 'required|numeric|min:0',
            'max_students' => 'required|integer|-1|min:-1',
            'max_staff' => 'required|integer|-1|min:-1',
            'max_batches' => 'required|integer|-1|min:-1',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
        ]);

        $plan->update($validated);

        return to_route('super-admin.plans.index')
            ->with('toast', ['type' => 'success', 'message' => 'Plan updated successfully.']);
    }

    public function destroy(Plan $plan): RedirectResponse
    {
        $plan->delete();

        return to_route('super-admin.plans.index')
            ->with('toast', ['type' => 'success', 'message' => 'Plan deleted successfully.']);
    }
}
