<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTeacherRequest;
use App\Http\Requests\UpdateTeacherRequest;
use App\Models\Branch;
use App\Models\Role;
use App\Models\User;
use App\Policies\PlanLimitsPolicy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class TeacherController extends Controller
{
public function index(Request $request): Response
    {
        if (! $request->user()->hasRoutePermission('teachers.index')) {
            abort(403);
        }

        $query = User::where(function ($q) {
            $q->where('role', 'teacher')->orWhere('role', 'inactive');
        });

        if ($status = $request->input('status')) {
            if ($status === 'active') {
                $query->where('role', 'teacher');
            } elseif ($status === 'inactive') {
                $query->where('role', 'inactive');
            }
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $teachers = $query->withCount('assignedBatches')->with('branch')->latest()->paginate(10)->withQueryString();

        return Inertia::render('teachers/index', [
            'teachers' => $teachers,
            'filters' => $request->only(['search', 'status']),
            'roles' => Role::query()->where('slug', '!=', 'owner')->orderBy('name')->get([ 'id', 'name', 'slug']),
        ]);
    }

public function create(Request $request): Response|RedirectResponse
    {
        if (! $request->user()->hasRoutePermission('teachers.create')) {
            abort(403);
        }

        $planLimits = new PlanLimitsPolicy;
        if (! $planLimits->createStaff($request->user())) {
            return to_route('subscription.index')->with('toast', [
                'type' => 'warning',
                'message' => 'You have reached the staff limit for your current plan. Please upgrade to add more staff.',
            ]);
        }

        $remaining = $planLimits->remaining($request->user(), 'staff');
        $limit = $planLimits->getLimit($request->user(), 'staff');

        return Inertia::render('teachers/create', [
            'planLimits' => [
                'can_create' => true,
                'remaining' => $remaining,
                'limit' => $limit,
            ],
            'roles' => Role::query()->where('slug', '!=', 'owner')->orderBy('name')->get(['id', 'name', 'slug']),
            'branches' => Branch::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

public function store(StoreTeacherRequest $request): RedirectResponse
    {
        if (! $request->user()->hasRoutePermission('teachers.store')) {
            abort(403);
        }

        $planLimits = new PlanLimitsPolicy;
        if (! $planLimits->createStaff($request->user())) {
            return to_route('subscription.index')->with('toast', [
                'type' => 'warning',
                'message' => 'You have reached the staff limit for your current plan. Please upgrade to add more staff.',
]);
        }

        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'teacher',
            'tenant_id' => $request->user()->tenant_id,
            'branch_id' => $request->branch_id,
            'avatar' => $data['avatar'] ?? null,
        ]);

        return to_route('teachers.index')->with('toast', ['type' => 'success', 'message' => 'Staff member created successfully.']);
    }

public function show(User $teacher): Response
    {
        if (! in_array($teacher->role, ['teacher', 'inactive'])) {
            abort(404);
        }

        $teacher->load(['assignedBatches.enrollments.student']);
        $teacher->loadCount('assignedBatches');

        $activeBatches = $teacher->assignedBatches()->where('status', 'active')->count();

        $totalStudents = $teacher->assignedBatches()
            ->withCount('enrollments')
            ->get()
            ->sum('enrollments_count');

        return Inertia::render('teachers/show', [
            'teacher' => $teacher,
            'stats' => [
                'active_batches' => $activeBatches,
                'total_students' => $totalStudents,
            ],
        ]);
    }

    public function edit(User $teacher): Response
    {
        if (! in_array($teacher->role, ['teacher', 'inactive'])) {
            abort(404);
        }

        return Inertia::render('teachers/edit', [
            'teacher' => $teacher,
            'roles' => Role::query()->where('slug', '!=', 'owner')->orderBy('name')->get(['id', 'name', 'slug']),
            'branches' => Branch::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

public function update(UpdateTeacherRequest $request, User $teacher): RedirectResponse
    {
        if (! in_array($teacher->role, ['teacher', 'inactive']) || ! $request->user()->hasRoutePermission('teachers.update')) {
            abort(403);
        }

$data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        if ($request->hasFile('avatar')) {
            if ($teacher->avatar) {
                \Storage::disk('public')->delete($teacher->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $teacher->update($data);

        return to_route('teachers.show', $teacher)->with('toast', ['type' => 'success', 'message' => 'Staff member updated successfully.']);
    }

public function destroy(Request $request, User $teacher): RedirectResponse
    {
        if (! in_array($teacher->role, ['teacher', 'inactive']) || ! $request->user()->hasRoutePermission('teachers.destroy')) {
            abort(403);
        }

        if ($teacher->role === 'inactive') {
            $teacher->update(['role' => 'teacher']);
            return to_route('teachers.index')->with('toast', ['type' => 'success', 'message' => 'Staff member reactivated successfully.']);
        }

        $teacher->update(['role' => 'inactive']);
        $teacher->assignedBatches()->detach();

        return to_route('teachers.index')->with('toast', ['type' => 'success', 'message' => 'Staff member deactivated successfully.']);
    }

    public function updateStatus(Request $request, User $teacher): RedirectResponse
    {
        if (! in_array($teacher->role, ['teacher', 'inactive']) || ! $request->user()->hasRoutePermission('teachers.approve')) {
            abort(403);
        }

        $status = $request->input('status');

        if ($status === 'active') {
            $teacher->update(['role' => 'teacher', 'is_approved' => true]);
            $message = 'Staff member activated successfully.';
        } elseif ($status === 'pending') {
            $teacher->update(['role' => 'teacher', 'is_approved' => false]);
            $message = 'Staff member set to pending approval.';
        } elseif ($status === 'inactive') {
            $teacher->update(['role' => 'inactive', 'is_approved' => false]);
            $teacher->assignedBatches()->detach();
            $message = 'Staff member deactivated successfully.';
        } else {
            abort(422);
        }

        return back()->with('toast', ['type' => 'success', 'message' => $message]);
    }

public function approve(Request $request, User $teacher): RedirectResponse
    {
        if (! in_array($teacher->role, ['teacher', 'inactive']) || ! $request->user()->hasRoutePermission('teachers.approve')) {
            abort(403);
        }

        $teacher->update(['is_approved' => true]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Staff member approved successfully.']);
    }

public function reject(Request $request, User $teacher): RedirectResponse
    {
        if (! in_array($teacher->role, ['teacher', 'inactive']) || ! $request->user()->hasRoutePermission('teachers.reject')) {
            abort(403);
        }

        $teacher->update(['is_approved' => false]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Staff member approval revoked.']);
    }
}


