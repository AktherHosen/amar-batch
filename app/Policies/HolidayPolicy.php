<?php

namespace App\Policies;

use App\Models\Holiday;
use App\Models\User;

class HolidayPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isTeacher();
    }

    public function view(User $user, Holiday $holiday): bool
    {
        return $user->isAdmin() || $user->isTeacher();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Holiday $holiday): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Holiday $holiday): bool
    {
        return $user->isAdmin();
    }
}
