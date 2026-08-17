<?php

namespace App\Policies;

use App\Models\User;

class TeacherPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRoutePermission('teachers.index');
    }

    public function view(User $user, User $teacher): bool
    {
        if ($user->id === $teacher->id) {
            return true;
        }

        return $user->hasRoutePermission('teachers.show');
    }

    public function create(User $user): bool
    {
        return $user->hasRoutePermission('teachers.create');
    }

    public function update(User $user, User $teacher): bool
    {
        return $user->hasRoutePermission('teachers.update');
    }

    public function delete(User $user, User $teacher): bool
    {
        return $user->hasRoutePermission('teachers.destroy');
    }
}