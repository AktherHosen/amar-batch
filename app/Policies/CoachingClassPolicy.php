<?php

namespace App\Policies;

use App\Models\CoachingClass;
use App\Models\User;

class CoachingClassPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, CoachingClass $coachingClass): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, CoachingClass $coachingClass): bool
    {
        return $user->isAdmin();
    }
}
