<?php

namespace App\Policies;

use App\Models\Tenant;
use App\Models\User;

class PlanLimitsPolicy
{
    /**
     * Check if the tenant can create more students.
     */
    public function createStudent(User $user): bool
    {
        return $this->checkLimit($user, 'students', 'max_students');
    }

    /**
     * Check if the tenant can create more staff.
     */
    public function createStaff(User $user): bool
    {
        return $this->checkLimit($user, 'staff', 'max_staff');
    }

    /**
     * Check if the tenant can create more batches.
     */
    public function createBatch(User $user): bool
    {
        return $this->checkLimit($user, 'batches', 'max_batches');
    }

    /**
     * Get the remaining count for a resource type.
     */
    public function remaining(User $user, string $type): ?int
    {
        $limitField = match ($type) {
            'students' => 'max_students',
            'staff' => 'max_staff',
            'batches' => 'max_batches',
            default => null,
        };

        if (! $limitField) {
            return null;
        }

        $tenant = $user->current_tenant;
        if (! $tenant || ! $tenant->subscription || ! $tenant->subscription->plan) {
            return 0;
        }

        $plan = $tenant->subscription->plan;
        $max = $plan->{$limitField};

        // -1 means unlimited
        if ($max === -1) {
            return null;
        }

        $current = $this->getCurrentCount($user, $type);

        return max(0, $max - $current);
    }

    /**
     * Get the limit for a resource type.
     */
    public function getLimit(User $user, string $type): ?int
    {
        $limitField = match ($type) {
            'students' => 'max_students',
            'staff' => 'max_staff',
            'batches' => 'max_batches',
            default => null,
        };

        if (! $limitField) {
            return null;
        }

        $tenant = $user->current_tenant;
        if (! $tenant || ! $tenant->subscription || ! $tenant->subscription->plan) {
            return 0;
        }

        $max = $tenant->subscription->plan->{$limitField};

        return $max === -1 ? null : $max;
    }

    /**
     * Get the current count for a resource type.
     */
    public function getCurrentCount(User $user, string $type): int
    {
        $tenant = $user->current_tenant;
        if (! $tenant) {
            return 0;
        }

        return match ($type) {
            'students' => $tenant->students()->where('status', 'active')->count(),
            'staff' => $tenant->users()->whereIn('users.role', ['staff', 'teacher'])->count(),
            'batches' => $tenant->batches()->count(),
            default => 0,
        };
    }

    private function checkLimit(User $user, string $type, string $limitField): bool
    {
        $tenant = $user->current_tenant;
        if (! $tenant) {
            return false;
        }

        // No subscription or plan = block
        if (! $tenant->subscription || ! $tenant->subscription->plan) {
            return false;
        }

        $plan = $tenant->subscription->plan;
        $max = $plan->{$limitField};

        // -1 means unlimited
        if ($max === -1) {
            return true;
        }

        $current = $this->getCurrentCount($user, $type);

        return $current < $max;
    }
}
