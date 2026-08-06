<?php

namespace App\Policies;

use App\Models\User;

class TeacherPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, User $teacher): bool
    {
        return $user->isAdmin() || $user->id === $teacher->id;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, User $teacher): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, User $teacher): bool
    {
        return $user->isAdmin();
    }
}
