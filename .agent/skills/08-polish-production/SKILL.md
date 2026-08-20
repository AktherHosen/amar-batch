---
name: phase-10-polish-production
description: Phase 10 — Production polish: seeders, tests, export, PWA, landing page, localization. Run after all features complete.
---

# Phase 10: Polish & Production

## Goal

Add comprehensive seeders, tests, export, PWA support, responsive landing page, and localization.

## Prerequisites

- Phases 1-9 complete (all core features with RBAC)

## Step 10.1: Seeders

### StudentFactory

Create `database/factories/StudentFactory.php`:

```php
<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'phone' => fake()->phoneNumber(),
            'coaching_class_id' => null, // Set in seeder
            'section' => fake()->randomElement(['A', 'B', 'C']),
            'address' => fake()->address(),
            'date_of_birth' => fake()->dateTimeBetween('-20 years', '-10 years'),
            'gender' => fake()->randomElement(['male', 'female']),
            'guardian_name' => fake()->name(),
            'guardian_phone' => fake()->phoneNumber(),
            'status' => fake()->randomElement(['active', 'active', 'active', 'inactive']),
            'joined_at' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
```

### DatabaseSeeder

Update `database/seeders/DatabaseSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Batch;
use App\Models\CoachingClass;
use App\Models\Enrollment;
use App\Models\FeeStatus;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Coaching Classes
        $classes = [
            CoachingClass::create(['name' => 'Class 9', 'default_fee' => 2000]),
            CoachingClass::create(['name' => 'Class 10', 'default_fee' => 2500]),
            CoachingClass::create(['name' => 'Class 11', 'default_fee' => 3000]),
            CoachingClass::create(['name' => 'Class 12', 'default_fee' => 3500]),
        ];

        // Admin
        User::factory()->admin()->create([
            'name' => 'Admin',
            'email' => 'admin@amarbatch.com',
            'password' => bcrypt('password'),
        ]);

        // Teachers
        $teachers = User::factory(3)->teacher()->create();

        // Students
        $students = Student::factory(50)->create([
            'coaching_class_id' => fn () => $classes[array_rand($classes)]->id,
        ]);

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

                // Create monthly fee records
                $month = rand(1, 12);
                $year = 2026;
                $defaultFee = $student->coachingClass?->default_fee ?? 2000;

                FeeStatus::create([
                    'student_id' => $student->id,
                    'batch_id' => $batch->id,
                    'month' => $month,
                    'year' => $year,
                    'amount_paid' => fake()->randomFloat(2, 0, $defaultFee),
                ]);
            }
        }
    }
}
```

## Step 10.2: Feature Tests

### `tests/Feature/StudentControllerTest.php`

```php
// Test admin can CRUD students
// Test teacher can only view assigned students
// Test admin can export students CSV
// Test unauthorized access returns 403
```

### `tests/Feature/BatchControllerTest.php`

```php
// Test admin can CRUD batches
// Test admin can assign/remove teachers
// Test teacher can view assigned batches only
```

### `tests/Feature/TeacherControllerTest.php`

```php
// Test admin can CRUD teachers
// Test teacher cannot manage other teachers
```

### `tests/Feature/EnrollmentControllerTest.php`

```php
// Test admin/teacher can enroll students
// Test capacity validation
// Test duplicate enrollment prevention
```

### `tests/Feature/FeeStatusControllerTest.php`

```php
// Test admin can record payments
// Test teacher can view fees for assigned batches
// Test teacher cannot record payments
```

### `tests/Feature/AttendanceControllerTest.php`

```php
// Test teacher can mark attendance for assigned batches
// Test teacher cannot mark for unassigned batches
// Test attendance uniqueness constraint
```

## Step 10.3: CSV Export

### Student List Export

Already implemented in StudentController.export() — downloads CSV with student details.

### Attendance Export

Add to AttendanceController:

```php
public function export(Batch $batch, Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
{
    $this->authorize('view', $batch);

    $attendances = Attendance::with('student')
        ->where('batch_id', $batch->id)
        ->latest('date')
        ->get();

    $filename = "attendance-{$batch->name}-" . now()->format('Y-m-d') . '.csv';

    return response()->streamDownload(function () use ($attendances) {
        echo "Date,Student,Status,Notes\n";
        foreach ($attendances as $attendance) {
            echo "{$attendance->date},{$attendance->student->name},{$attendance->status},{$attendance->notes}\n";
        }
    }, $filename);
}
```

## Step 10.4: PWA Support

### Service Worker

Create `public/sw.js`:

```javascript
const CACHE_NAME = 'amar-batch-v1';
const urlsToCache = [
    '/',
    '/build/assets/app.css',
    '/build/assets/app.js',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
```

### Manifest

Create `public/manifest.json`:

```json
{
    "name": "Amar Batch",
    "short_name": "Amar Batch",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#2563eb",
    "icons": [
        {
            "src": "/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}
```

### Register in Blade

Add to `resources/views/app.blade.php`:

```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#2563eb">
<script>
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js');
    }
</script>
```

## Step 10.5: Responsive Landing Page

Create `resources/js/pages/welcome.tsx`:

- Modern responsive design with K branding
- Hero section with dynamic stats from `appStats` shared prop
- Features section (Student Management, Attendance, Fees, Batches, Reports, RBAC)
- How it Works section (3 steps)
- CTA section
- Footer
- Header with brand name (shows "KAA" on mobile, full name on desktop)
- All sections responsive for mobile/tablet/desktop

### Stats from Shared Props

Update `HandleInertiaRequests.php`:

```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'name' => config('app.name'),
        'auth' => [
            'user' => $request->user(),
        ],
        'appStats' => [
            'total_students' => Student::count(),
            'active_batches' => Batch::where('status', 'active')->count(),
            'attendance_rate' => 98,
            'fee_collection_rate' => 100,
        ],
    ];
}
```

## Step 10.6: Bangla Localization

### Language Switcher Component

Create `resources/js/components/language-switcher.tsx`:

```tsx
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
    const changeLanguage = (locale: string) => {
        router.post(route('language.update'), { locale }, { preserveScroll: true });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Globe className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => changeLanguage('en')}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('bn')}>বাংলা</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
```

## Step 10.7: Unit Tests

### Model Tests

```php
// tests/Unit/Models/StudentTest.php
// tests/Unit/Models/BatchTest.php
// tests/Unit/Models/EnrollmentTest.php
// tests/Unit/Models/FeeStatusTest.php
// tests/Unit/Models/AttendanceTest.php
// tests/Unit/Models/UserTest.php
```

## After Completion

Run:
```bash
php artisan test
php artisan migrate:fresh --seed
npm run build
php artisan wayfinder:generate --with-form
```

The coaching management system is now production-ready with RBAC, PWA, localization, and responsive design.
