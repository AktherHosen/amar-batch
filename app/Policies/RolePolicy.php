<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Role $role): bool
    {
        if (in_array($role->slug, ['owner', 'super_admin'], true)) {
            return false;
        }

        return $user->isAdmin();
    }

    public function delete(User $user, Role $role): bool
    {
        if ($role->is_system) {
            return false;
        }

        if ($role->users()->count() > 0) {
            return false;
        }

        return $user->isAdmin();
    }
}