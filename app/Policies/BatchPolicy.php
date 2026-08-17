<?php

namespace App\Policies;

use App\Models\Batch;
use App\Models\User;

class BatchPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRoutePermission('batches.index');
    }

    public function view(User $user, Batch $batch): bool
    {
        if (! $user->hasRoutePermission('batches.show')) {
            return false;
        }

        if ($user->isAdmin()) {
            return true;
        }
        if ($user->isTeacher()) {
            return $batch->teachers()->where('users.id', $user->id)->exists();
        }

        return $batch->students()->where('students.id', $user->student_id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->hasRoutePermission('batches.create');
    }

    public function update(User $user, Batch $batch): bool
    {
        return $user->hasRoutePermission('batches.update');
    }

    public function delete(User $user, Batch $batch): bool
    {
        return $user->hasRoutePermission('batches.destroy');
    }

    public function manageStudents(User $user, Batch $batch): bool
    {
        if ($user->hasRoutePermission('enrollments.store') || $user->hasRoutePermission('enrollments.update')) {
            return true;
        }

        if ($user->isTeacher()) {
            return $batch->teachers()->where('users.id', $user->id)->exists();
        }

        return false;
    }
}