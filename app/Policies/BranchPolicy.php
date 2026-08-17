<?php

namespace App\Policies;

use App\Models\Branch;
use App\Models\User;

class BranchPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRoutePermission('branches.index');
    }

    public function view(User $user, Branch $branch): bool
    {
        return $user->hasRoutePermission('branches.show');
    }

    public function create(User $user): bool
    {
        return $user->hasRoutePermission('branches.create');
    }

    public function update(User $user, Branch $branch): bool
    {
        return $user->hasRoutePermission('branches.update');
    }

    public function delete(User $user, Branch $branch): bool
    {
        return $user->hasRoutePermission('branches.destroy');
    }
}