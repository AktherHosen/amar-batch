<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCoachingClassRequest;
use App\Http\Requests\UpdateCoachingClassRequest;
use App\Models\CoachingClass;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CoachingClassController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', CoachingClass::class);

        $query = CoachingClass::withCount('students');

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $classes = $query->orderBy('name')->paginate(15)->withQueryString();

        return Inertia::render('coaching-classes/index', [
            'classes' => $classes,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', CoachingClass::class);

        return Inertia::render('coaching-classes/create');
    }

    public function store(StoreCoachingClassRequest $request): RedirectResponse
    {
        $this->authorize('create', CoachingClass::class);

        CoachingClass::create($request->validated());

        return to_route('coaching-classes.index')->with('toast', ['type' => 'success', 'message' => 'Class created successfully.']);
    }

    public function edit(CoachingClass $coachingClass): Response
    {
        $this->authorize('update', $coachingClass);

        return Inertia::render('coaching-classes/edit', [
            'coachingClass' => $coachingClass,
        ]);
    }

    public function update(UpdateCoachingClassRequest $request, CoachingClass $coachingClass): RedirectResponse
    {
        $this->authorize('update', $coachingClass);

        $coachingClass->update($request->validated());

        return to_route('coaching-classes.index')->with('toast', ['type' => 'success', 'message' => 'Class updated successfully.']);
    }

    public function destroy(CoachingClass $coachingClass): RedirectResponse
    {
        $this->authorize('delete', $coachingClass);

        $coachingClass->delete();

        return to_route('coaching-classes.index')->with('toast', ['type' => 'success', 'message' => 'Class deleted successfully.']);
    }
}
