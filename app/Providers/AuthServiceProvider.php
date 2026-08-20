<?php

namespace App\Providers;

use App\Models\Attendance;
use App\Models\Batch;
use App\Models\CoachingClass;
use App\Models\Enrollment;
use App\Models\FeeReceipt;
use App\Models\Holiday;
use App\Models\Notice;
use App\Models\Student;
use App\Models\User;
use App\Policies\AttendancePolicy;
use App\Policies\BatchPolicy;
use App\Policies\CoachingClassPolicy;
use App\Policies\EnrollmentPolicy;
use App\Policies\FeeReceiptPolicy;
use App\Policies\HolidayPolicy;
use App\Policies\NoticePolicy;
use App\Policies\StudentPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Student::class => StudentPolicy::class,
        Batch::class => BatchPolicy::class,
        CoachingClass::class => CoachingClassPolicy::class,
        Attendance::class => AttendancePolicy::class,
        Enrollment::class => EnrollmentPolicy::class,
        Notice::class => NoticePolicy::class,
        Holiday::class => HolidayPolicy::class,
        FeeReceipt::class => FeeReceiptPolicy::class,
    ];

    public function boot(): void
    {
        Gate::define('role', fn (User $user, string $role) => in_array($user->role, (array) $role));
    }
}
