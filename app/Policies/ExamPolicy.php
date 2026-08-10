<?php

namespace App\Policies;

use App\Models\Exam;
use App\Models\User;

class ExamPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isTeacher();
    }

    public function view(User $user, Exam $exam): bool
    {
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
        return $user->isAdmin();
    }

    public function update(User $user, Exam $exam): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Exam $exam): bool
    {
        return $user->isAdmin();
    }
}
