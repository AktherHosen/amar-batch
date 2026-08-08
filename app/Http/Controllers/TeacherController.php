<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTeacherRequest;
use App\Http\Requests\UpdateTeacherRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class TeacherController extends Controller
{
    public function index(Request $request): Response
    {
        if (! $request->user()->isAdmin()) {
            abort(403);
        }

        $query = User::where('role', 'teacher');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $teachers = $query->withCount('assignedBatches')->latest()->paginate(10)->withQueryString();

        return Inertia::render('teachers/index', [
            'teachers' => $teachers,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(Request $request): Response
    {
        if (! $request->user()->isAdmin()) {
            abort(403);
        }

        return Inertia::render('teachers/create');
    }

    public function store(StoreTeacherRequest $request): RedirectResponse
    {
        if (! $request->user()->isAdmin()) {
            abort(403);
        }

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'teacher',
        ]);

        return to_route('teachers.index')->with('toast', ['type' => 'success', 'message' => 'Teacher created successfully.']);
    }

    public function show(User $teacher): Response
    {
        if (! $teacher->isTeacher()) {
            abort(404);
        }

        $teacher->load(['assignedBatches.enrollments.student']);
        $teacher->loadCount('assignedBatches');

        return Inertia::render('teachers/show', [
            'teacher' => $teacher,
        ]);
    }

    public function edit(User $teacher): Response
    {
        if (! $teacher->isTeacher()) {
            abort(404);
        }

        return Inertia::render('teachers/edit', [
            'teacher' => $teacher,
        ]);
    }

    public function update(UpdateTeacherRequest $request, User $teacher): RedirectResponse
    {
        if (! $request->user()->isAdmin() || ! $teacher->isTeacher()) {
            abort(403);
        }

        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $teacher->update($data);

        return to_route('teachers.show', $teacher)->with('toast', ['type' => 'success', 'message' => 'Teacher updated successfully.']);
    }

    public function destroy(Request $request, User $teacher): RedirectResponse
    {
        if (! $request->user()->isAdmin() || ! $teacher->isTeacher()) {
            abort(403);
        }

        $teacher->update(['role' => 'inactive']);
        $teacher->assignedBatches()->detach();

        return to_route('teachers.index')->with('toast', ['type' => 'success', 'message' => 'Teacher deactivated successfully.']);
    }

    public function approve(Request $request, User $teacher): RedirectResponse
    {
        if (! $request->user()->isAdmin() || ! $teacher->isTeacher()) {
            abort(403);
        }

        $teacher->update(['is_approved' => true]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Teacher approved successfully.']);
    }

    public function reject(Request $request, User $teacher): RedirectResponse
    {
        if (! $request->user()->isAdmin() || ! $teacher->isTeacher()) {
            abort(403);
        }

        $teacher->update(['is_approved' => false]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Teacher approval revoked.']);
    }
}
