<?php

namespace App\Policies;

use App\Models\Exam;
use App\Models\User;

class ExamPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRoutePermission('exams.index');
    }

    public function view(User $user, Exam $exam): bool
    {
        if (! $user->hasRoutePermission('exams.show')) {
            return false;
        }

        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isTeacher()) {
            return $user->assignedBatches()->where('batches.id', $exam->batch_id)->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasRoutePermission('exams.create');
    }

    public function update(User $user, Exam $exam): bool
    {
        return $user->hasRoutePermission('exams.update');
    }

    public function delete(User $user, Exam $exam): bool
    {
        return $user->hasRoutePermission('exams.destroy');
    }
}