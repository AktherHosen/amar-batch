<?php

namespace App\Providers;

use App\Models\Batch;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Student::class => \App\Policies\StudentPolicy::class,
        Batch::class => \App\Policies\BatchPolicy::class,
    ];

    public function boot(): void
    {
        Gate::define('role', fn (User $user, string $role) => in_array($user->role, (array) $role));
    }
}
