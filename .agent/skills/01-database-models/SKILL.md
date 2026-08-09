---
name: phase-1-database-models
description: Phase 1 — Create all database migrations and Eloquent models with RBAC: users role, coaching_classes, students, batches, teacher_batch pivot, enrollments, fee_statuses, attendances.
---

# Phase 1: Database & Core Models

## Goal

Create the foundational database schema with RBAC support for the entire coaching management system.

## Prerequisites

- Laravel project with Fortify auth already set up
- MySQL database `amar_batch` configured

## Step 1.1: Add Role + Student FK to Users

Create `database/migrations/xxxx_add_role_and_student_to_users_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'teacher'])->default('admin')->after('email');
            $table->foreignId('student_id')->nullable()->after('role')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
            $table->dropForeign(['student_id']);
            $table->dropColumn('student_id');
        });
    }
};
```

## Step 1.2: Coaching Classes Migration & Model

Create `database/migrations/xxxx_create_coaching_classes_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coaching_classes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('default_fee', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coaching_classes');
    }
};
```

### Model: `app/Models/CoachingClass.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CoachingClass extends Model
{
    protected $fillable = ['name', 'default_fee'];

    protected function casts(): array
    {
        return ['default_fee' => 'decimal:2'];
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }
}
```

## Step 1.3: Students Migration & Model

Create `database/migrations/xxxx_create_students_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->foreignId('coaching_class_id')->nullable()->constrained()->nullOnDelete();
            $table->string('section')->nullable();
            $table->text('address')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('guardian_phone')->nullable();
            $table->string('photo')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->date('joined_at')->nullable();
            $table->date('left_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
```

### Model: `app/Models/Student.php`

```php
<?php

namespace App\Models;

use Database\Factories\StudentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'phone', 'coaching_class_id', 'section', 'address', 'date_of_birth',
        'gender', 'guardian_name', 'guardian_phone', 'photo', 'status', 'joined_at', 'left_at',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'joined_at' => 'date',
            'left_at' => 'date',
        ];
    }

    public function coachingClass(): BelongsTo
    {
        return $this->belongsTo(CoachingClass::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function batches()
    {
        return $this->belongsToMany(Batch::class, 'enrollments')
            ->withPivot('status', 'enrolled_at')
            ->withTimestamps();
    }

    public function feeStatuses(): HasMany
    {
        return $this->hasMany(FeeStatus::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }
}
```

## Step 1.4: Batches Migration & Model

Create `database/migrations/xxxx_create_batches_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('batches', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('subject')->nullable();
            $table->string('days')->nullable(); // e.g. "Sun, Mon, Tue"
            $table->string('time')->nullable(); // e.g. "10:00 AM - 12:00 PM"
            $table->integer('capacity')->default(30);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->enum('status', ['active', 'inactive', 'archived'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('batches');
    }
};
```

### Model: `app/Models/Batch.php`

```php
<?php

namespace App\Models;

use Database\Factories\BatchFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Batch extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'subject', 'days', 'time', 'capacity', 'start_date',
        'end_date', 'status',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function teachers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'teacher_batch', 'batch_id', 'teacher_id')
            ->withPivot('assigned_at')
            ->withTimestamps();
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'enrollments')
            ->withPivot('status', 'enrolled_at')
            ->withTimestamps();
    }

    public function feeStatuses(): HasMany
    {
        return $this->hasMany(FeeStatus::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function enrolledCount(): int
    {
        return $this->enrollments()->where('status', 'active')->count();
    }
}
```

## Step 1.5: Teacher-Batch Pivot Migration

Create `database/migrations/xxxx_create_teacher_batch_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_batch', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('batch_id')->constrained()->cascadeOnDelete();
            $table->timestamp('assigned_at');
            $table->timestamps();
            $table->unique(['teacher_id', 'batch_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_batch');
    }
};
```

## Step 1.6: Enrollment Migration & Model

Create `database/migrations/xxxx_create_enrollments_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('batch_id')->constrained()->cascadeOnDelete();
            $table->timestamp('enrolled_at');
            $table->enum('status', ['active', 'completed', 'dropped'])->default('active');
            $table->timestamps();
            $table->unique(['student_id', 'batch_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};
```

### Model: `app/Models/Enrollment.php`

```php
<?php

namespace App\Models;

use Database\Factories\EnrollmentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = ['student_id', 'batch_id', 'enrolled_at', 'status'];

    protected function casts(): array
    {
        return ['enrolled_at' => 'datetime'];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }
}
```

## Step 1.7: Fee Status Migration & Model (Monthly Tracking)

Create `database/migrations/xxxx_create_fee_statuses_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fee_statuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('batch_id')->constrained()->cascadeOnDelete();
            $table->integer('month'); // 1-12
            $table->integer('year');  // e.g. 2026
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['student_id', 'batch_id', 'month', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_statuses');
    }
};
```

### Model: `app/Models/FeeStatus.php`

```php
<?php

namespace App\Models;

use Database\Factories\FeeStatusFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeeStatus extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id', 'batch_id', 'month', 'year', 'amount_paid', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount_paid' => 'decimal:2',
            'month' => 'integer',
            'year' => 'integer',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    public function getMonthNameAttribute(): string
    {
        return mktime(0, 0, 0, $this->month, 1)
            ? date('F', mktime(0, 0, 0, $this->month, 1))
            : '';
    }
}
```

## Step 1.8: Attendance Migration & Model

Create `database/migrations/xxxx_create_attendances_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('batch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('marked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('date');
            $table->enum('status', ['present', 'absent', 'late'])->default('present');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['student_id', 'batch_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
```

### Model: `app/Models/Attendance.php`

```php
<?php

namespace App\Models;

use Database\Factories\AttendanceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = ['student_id', 'batch_id', 'marked_by', 'date', 'status', 'notes'];

    protected function casts(): array
    {
        return ['date' => 'date'];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    public function markedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'marked_by');
    }
}
```

## Step 1.9: Update User Model

Update `app/Models/User.php` to add role and relationships:

```php
<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable implements PasskeyUser
{
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    protected $fillable = ['name', 'email', 'password', 'role', 'student_id'];

    protected $hidden = ['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function assignedBatches(): BelongsToMany
    {
        return $this->belongsToMany(Batch::class, 'teacher_batch', 'teacher_id', 'batch_id')
            ->withPivot('assigned_at')
            ->withTimestamps();
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isTeacher(): bool
    {
        return $this->role === 'teacher';
    }
}
```

## Step 1.10: RBAC Middleware + Gate

Create `app/Http/Middleware/RoleMiddleware.php`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!auth()->check()) {
            return redirect('/login');
        }

        if (!in_array(auth()->user()->role, $roles)) {
            abort(403, 'Unauthorized.');
        }

        return $next($request);
    }
}
```

Register in `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'role' => \App\Http\Middleware\RoleMiddleware::class,
    ]);
})
```

## Step 1.11: Authorization Policies

Create `app/Providers/AuthServiceProvider.php` (or update existing):

```php
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
        Gate::define('role', fn(User $user, string $role) => in_array($user->role, (array) $role));
    }
}
```

Create `app/Policies/StudentPolicy.php`:

```php
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
        if ($user->isAdmin()) return true;
        if ($user->isTeacher()) {
            return $user->assignedBatches()
                ->whereHas('enrollments', fn($q) => $q->where('student_id', $student->id))
                ->exists();
        }
        return false;
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
```

Create `app/Policies/BatchPolicy.php`:

```php
<?php

namespace App\Policies;

use App\Models\Batch;
use App\Models\User;

class BatchPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Batch $batch): bool
    {
        if ($user->isAdmin()) return true;
        if ($user->isTeacher()) {
            return $batch->teachers()->where('users.id', $user->id)->exists();
        }
        return false;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Batch $batch): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Batch $batch): bool
    {
        return $user->isAdmin();
    }

    public function manageStudents(User $user, Batch $batch): bool
    {
        if ($user->isAdmin()) return true;
        if ($user->isTeacher()) {
            return $batch->teachers()->where('users.id', $user->id)->exists();
        }
        return false;
    }
}
```

## After Completion

Run:
```bash
php artisan migrate
```

Then say: **"Load the phase-2-student-management skill"**
