<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangeUserRoleRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use App\Policies\PlanLimitsPolicy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        if (! $request->user()->isAdmin()) {
            abort(403);
        }

        $query = User::query();

        if ($status = $request->input('status')) {
            if ($status === 'active') {
                $query->where('role', '!=', 'inactive');
            } elseif ($status === 'inactive') {
                $query->where('role', 'inactive');
            }
        }

        if ($role = $request->input('role')) {
            $query->where('role', $role);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->withCount('assignedBatches')->latest()->paginate(10)->withQueryString();

        $users->getCollection()->transform(function (User $user) {
            $user->setAttribute('is_owner', $user->isOwner());

            return $user;
        });

        return Inertia::render('users/index', [
            'users' => $users,
            'filters' => $request->only(['search', 'status', 'role']),
            'roles' => Role::query()->orderBy('name')->get(['id', 'name', 'slug']),
        ]);
    }

    public function create(Request $request): Response|RedirectResponse
    {
        if (! $request->user()->isAdmin()) {
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

        return Inertia::render('users/create', [
            'planLimits' => [
                'can_create' => true,
                'remaining' => $remaining,
                'limit' => $limit,
            ],
            'roles' => Role::query()->where('slug', '!=', 'owner')->orderBy('name')->get(['id', 'name', 'slug']),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        if (! $request->user()->isAdmin()) {
            abort(403);
        }

        $planLimits = new PlanLimitsPolicy;
        if (! $planLimits->createStaff($request->user())) {
            return to_route('subscription.index')->with('toast', [
                'type' => 'warning',
                'message' => 'You have reached the staff limit for your current plan. Please upgrade to add more staff.',
            ]);
        }

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'staff',
            'tenant_id' => $request->user()->tenant_id,
            'avatar' => $request->hasFile('avatar')
                ? $request->file('avatar')->store('avatars', 'public')
                : null,
        ]);

        return to_route('users.index')->with('toast', ['type' => 'success', 'message' => 'User created successfully.']);
    }

    public function show(User $user): Response
    {
        $user->setAttribute('is_owner', $user->isOwner());

        if ($user->role === 'teacher') {
            $user->load(['assignedBatches.enrollments.student']);
            $user->loadCount('assignedBatches');
        }

        return Inertia::render('users/show', [
            'user' => $user,
            'roles' => Role::query()->orderBy('name')->get(['id', 'name', 'slug']),
        ]);
    }

    public function edit(User $user): Response
    {
        abort_if($user->isOwner(), 403);

        return Inertia::render('users/edit', [
            'user' => $user,
            'roles' => Role::query()->where('slug', '!=', 'owner')->orderBy('name')->get(['id', 'name', 'slug']),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        if ($user->isOwner()) {
            abort(403);
        }

        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                \Storage::disk('public')->delete($user->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($data);

        return to_route('users.show', $user)->with('toast', ['type' => 'success', 'message' => 'User updated successfully.']);
    }

    public function changeRole(ChangeUserRoleRequest $request, User $user): RedirectResponse
    {
        if ($user->isOwner()) {
            abort(403);
        }

        $user->update(['role' => $request->role]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Role assigned successfully.']);
    }

    public function deactivate(Request $request, User $user): RedirectResponse
    {
        if (! $request->user()->isAdmin() || $user->isOwner()) {
            abort(403);
        }

        $user->update(['role' => 'inactive']);
        $user->assignedBatches()->detach();

        return back()->with('toast', ['type' => 'success', 'message' => 'Access revoked successfully.']);
    }

    public function reactivate(Request $request, User $user): RedirectResponse
    {
        if (! $request->user()->isAdmin() || $user->isOwner()) {
            abort(403);
        }

        $user->update(['role' => 'staff', 'is_approved' => false]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Access restored successfully.']);
    }

    public function approve(Request $request, User $user): RedirectResponse
    {
        if (! $request->user()->isAdmin() || $user->isOwner()) {
            abort(403);
        }

        $user->update(['is_approved' => true]);

        return back()->with('toast', ['type' => 'success', 'message' => 'User approved successfully.']);
    }

    public function reject(Request $request, User $user): RedirectResponse
    {
        if (! $request->user()->isAdmin() || $user->isOwner()) {
            abort(403);
        }

        $user->update(['is_approved' => false]);

        return back()->with('toast', ['type' => 'success', 'message' => 'User approval revoked.']);
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if (! $request->user()->isAdmin() || $user->isOwner()) {
            abort(403);
        }

        $user->assignedBatches()->detach();
        $user->update(['role' => 'inactive']);

        return to_route('users.index')->with('toast', ['type' => 'success', 'message' => 'User deactivated successfully.']);
    }
}