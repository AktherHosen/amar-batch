<?php

namespace App\Policies;

use App\Models\Student;
use App\Models\User;

class StudentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isTeacher();
    }

    public function view(User $user, Student $student): bool
    {
        if ($user->isAdmin()) {
            return true;
        }
        if ($user->isTeacher()) {
            return $user->assignedBatches()
                ->whereHas('enrollments', fn ($q) => $q->where('student_id', $student->id))
                ->exists();
        }

        return $user->student_id === $student->id;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Student $student): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Student $student): bool
    {
        return $user->isAdmin();
    }
}
