<?php

namespace App\Policies;

use App\Models\FeeReceipt;
use App\Models\User;

class FeeReceiptPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, FeeReceipt $receipt): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, FeeReceipt $receipt): bool
    {
        return $user->isAdmin();
    }
}
