<?php

namespace App\Providers;

use App\Models\Batch;
use App\Models\CoachingClass;
use App\Models\Student;
use App\Models\User;
use App\Policies\BatchPolicy;
use App\Policies\CoachingClassPolicy;
use App\Policies\StudentPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Student::class => StudentPolicy::class,
        Batch::class => BatchPolicy::class,
        CoachingClass::class => CoachingClassPolicy::class,
    ];

    public function boot(): void
    {
        Gate::define('role', fn (User $user, string $role) => in_array($user->role, (array) $role));
    }
}
