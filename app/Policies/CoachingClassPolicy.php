<?php

namespace App\Policies;

use App\Models\CoachingClass;
use App\Models\User;

class CoachingClassPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRoutePermission('coaching-classes.index');
    }

    public function create(User $user): bool
    {
        return $user->hasRoutePermission('coaching-classes.create');
    }

    public function update(User $user, CoachingClass $coachingClass): bool
    {
        return $user->hasRoutePermission('coaching-classes.update');
    }

    public function delete(User $user, CoachingClass $coachingClass): bool
    {
        return $user->hasRoutePermission('coaching-classes.destroy');
    }
}