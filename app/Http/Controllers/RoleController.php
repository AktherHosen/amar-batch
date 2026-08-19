<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Role::class);

        $roles = Role::withCount('users')
            ->orderBy('is_system', 'desc')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('roles/index', [
            'roles' => $roles,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Role::class);

        return Inertia::render('roles/create', [
            'groups' => config('role-routes.groups'),
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $this->authorize('create', Role::class);

        Role::create([
            'name' => $request->name,
            'slug' => $request->slug,
            'description' => $request->description,
            'permissions' => $request->permissions ?? [],
            'is_system' => false,
            'tenant_id' => $request->user()->tenant_id,
        ]);

        return to_route('roles.index')->with('toast', ['type' => 'success', 'message' => 'Role created successfully.']);
    }

    public function edit(Role $role): Response
    {
        $this->authorize('update', $role);

        return Inertia::render('roles/edit', [
            'role' => $role,
            'groups' => config('role-routes.groups'),
        ]);
    }

    public function show(Role $role): RedirectResponse
    {
        return to_route('roles.edit', $role);
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $this->authorize('update', $role);

        $role->update([
            'name' => $request->name,
            'description' => $request->description,
            'permissions' => $request->permissions ?? [],
        ]);

        return to_route('roles.index')->with('toast', ['type' => 'success', 'message' => 'Role updated successfully.']);
    }

    public function destroy(Role $role): RedirectResponse
    {
        if ($role->is_system) {
            return back()->withErrors(['role' => 'System roles cannot be deleted.']);
        }

        if ($role->users()->count() > 0) {
            return back()->withErrors(['role' => 'Cannot delete role with assigned users. Unassign users first.']);
        }

        $role->delete();

        return to_route('roles.index')->with('toast', ['type' => 'success', 'message' => 'Role deleted successfully.']);
    }
}