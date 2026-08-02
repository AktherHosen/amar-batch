---
name: phase-9-polish-production
description: Phase 9 — Production polish: role-based seeders, comprehensive tests, search, UX, export. Run after all features complete.
---

# Phase 9: Polish & Production

## Goal

Add comprehensive seeders, tests, and polish with RBAC considerations.

## Prerequisites

- Phases 1-8 complete (all core features with RBAC)

## Step 9.1: Seeders

### UserFactory Update

Update `database/factories/UserFactory.php` to support roles:

```php
public function admin(): static
{
    return $this->state(fn (array $attributes) => ['role' => 'admin']);
}

public function teacher(): static
{
    return $this->state(fn (array $attributes) => ['role' => 'teacher']);
}

public function student(): static
{
    return $this->state(fn (array $attributes) => ['role' => 'student']);
}
```

### DatabaseSeeder

Update `database/seeders/DatabaseSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\FeeStatus;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::factory()->admin()->create([
            'name' => 'Admin',
            'email' => 'admin@academia.com',
            'password' => bcrypt('password'),
        ]);

        // Teachers
        $teachers = User::factory(5)->teacher()->create();

        // Students (as users with role=student + student records)
        $students = Student::factory(50)->create();

        // Create user accounts for some students
        foreach ($students->random(20) as $student) {
            User::factory()->student()->create([
                'name' => $student->name,
                'email' => $student->email,
                'student_id' => $student->id,
                'password' => bcrypt('password'),
            ]);
        }

        // Batches
        $batches = Batch::factory(8)->create();

        // Assign teachers to batches
        foreach ($batches as $batch) {
            $assignedTeachers = $teachers->random(rand(1, 2));
            foreach ($assignedTeachers as $teacher) {
                $batch->teachers()->attach($teacher->id, ['assigned_at' => now()]);
            }
        }

        // Enroll students + fee statuses
        foreach ($batches as $batch) {
            $enrolledStudents = $students->random(rand(5, 15));
            foreach ($enrolledStudents as $student) {
                Enrollment::create([
                    'student_id' => $student->id,
                    'batch_id' => $batch->id,
                    'enrolled_at' => fake()->dateTimeBetween('-2 months', 'now'),
                    'status' => 'active',
                ]);

                FeeStatus::create([
                    'student_id' => $student->id,
                    'batch_id' => $batch->id,
                    'amount_paid' => fake()->randomFloat(2, 0, $batch->fees_amount),
                    'amount_due' => $batch->fees_amount,
                    'due_date' => fake()->dateTimeBetween('now', '+30 days'),
                    'status' => fake()->randomElement(['paid', 'partial', 'unpaid']),
                ]);
            }
        }
    }
}
```

## Step 9.2: Feature Tests

### `tests/Feature/StudentTest.php`

```php
// Test admin can CRUD students
// Test teacher can only view assigned students
// Test student can only view own profile
// Test unauthorized access returns 403
```

### `tests/Feature/BatchTest.php`

```php
// Test admin can CRUD batches
// Test admin can assign/remove teachers
// Test teacher can view assigned batches only
// Test student can view enrolled batches only
```

### `tests/Feature/TeacherTest.php`

```php
// Test admin can CRUD teachers
// Test teacher cannot manage other teachers
// Test student cannot access teacher management
```

### `tests/Feature/EnrollmentTest.php`

```php
// Test admin/teacher can enroll students
// Test capacity validation
// Test duplicate enrollment prevention
// Test teacher cannot enroll in unassigned batch
```

### `tests/Feature/FeeTest.php`

```php
// Test admin can record payments
// Test teacher can view fees for assigned batches
// Test student can view own fees only
// Test teacher/student cannot record payments
```

### `tests/Feature/AttendanceTest.php`

```php
// Test teacher can mark attendance for assigned batches
// Test teacher cannot mark for unassigned batches
// Test student can view own attendance
// Test attendance uniqueness constraint
```

### `tests/Feature/RBACTest.php`

```php
// Test role middleware blocks unauthorized access
// Test admin has full access
// Test teacher has limited access
// Test student has minimal access
```

## Step 9.3: Search & Filters

Add to all list pages:
- Debounced search inputs
- Status/date range filters
- Pagination with query string preservation

## Step 9.4: UX Polish

- Toast notifications on all mutations
- Loading states (Skeleton components)
- Empty states with messages
- Confirmation dialogs for destructive actions
- Responsive design for mobile

## Step 9.5: Export

### Student List CSV

```php
Route::get('students/export', function () {
    $students = Student::all();
    // Generate CSV with columns: Name, Email, Phone, Status, Enrolled Batches
    return response()->streamDownload(function () use ($students) {
        echo "Name,Email,Phone,Status\n";
        foreach ($students as $student) {
            echo "{$student->name},{$student->email},{$student->phone},{$student->status}\n";
        }
    }, 'students-' . now()->format('Y-m-d') . '.csv');
})->middleware('role:admin');
```

### Attendance Sheet Print

Create print-friendly attendance sheet component for a batch + date.

## After Completion

Run:
```bash
php artisan test
php artisan migrate:fresh --seed
npm run build
```

The coaching management system is now production-ready with RBAC.
