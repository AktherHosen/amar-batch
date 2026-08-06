---
name: phase-5-enrollment
description: Phase 5 — Build enrollment system with RBAC: admin/teacher enroll students, capacity checks, auto-fee generation. Run after Phase 4.
---

# Phase 5: Enrollment System

## Goal

Connect students to batches with role-based enrollment access and automatic fee status creation.

## Prerequisites

- Phase 3 complete (Batch CRUD)
- Phase 4 complete (Teacher Management)

## Step 5.1: EnrollmentController with RBAC

Create `app/Http/Controllers/EnrollmentController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class EnrollmentController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $batch = Batch::findOrFail($request->batch_id);

        // Only admin or assigned teacher can enroll
        $this->authorize('manageStudents', $batch);

        $request->validate([
            'student_id' => 'required|exists:students,id',
            'batch_id' => 'required|exists:batches,id',
        ]);

        // Check capacity
        $enrolledCount = $batch->enrollments()->where('status', 'active')->count();
        if ($enrolledCount >= $batch->capacity) {
            throw ValidationException::withMessages([
                'batch_id' => 'This batch has reached its maximum capacity.',
            ]);
        }

        // Check duplicate
        $existing = Enrollment::where('student_id', $request->student_id)
            ->where('batch_id', $request->batch_id)
            ->where('status', 'active')
            ->exists();

        if ($existing) {
            throw ValidationException::withMessages([
                'student_id' => 'This student is already enrolled in this batch.',
            ]);
        }

        Enrollment::create([
            'student_id' => $request->student_id,
            'batch_id' => $request->batch_id,
            'enrolled_at' => now(),
            'status' => 'active',
        ]);

        // Auto-create fee status
        $batch->feeStatuses()->create([
            'student_id' => $request->student_id,
            'amount_due' => $batch->fees_amount,
            'due_date' => now()->addDays(30),
            'status' => 'unpaid',
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Student enrolled successfully.']);

        return back();
    }

    public function update(Enrollment $enrollment, Request $request): RedirectResponse
    {
        $batch = $enrollment->batch;
        $this->authorize('manageStudents', $batch);

        $request->validate([
            'status' => 'required|in:completed,dropped',
        ]);

        $enrollment->update(['status' => $request->status]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Enrollment status updated.']);

        return back();
    }

    public function destroy(Enrollment $enrollment): RedirectResponse
    {
        $batch = $enrollment->batch;
        $this->authorize('manageStudents', $batch);

        $enrollment->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Enrollment removed.']);

        return back();
    }
}
```

## Step 5.2: Enroll Modal Component

Create `resources/js/components/enroll-modal.tsx`:

- Dialog with student search/select and batch dropdown
- Shows capacity validation errors
- Admin: can select any batch
- Teacher: can only select from assigned batches

## Step 5.3: Batch Detail Integration

Update batch show page:
- Admin/Teacher: "Enroll Student" button
- Teacher: can only manage their assigned batches (enforce via policy)

## Step 5.4: Student Detail Integration

Update student show page:
- Admin: "Enroll in Batch" button
- Show enrolled batches with status

## Step 5.5: Routes

Create `routes/enrollments.php`:

```php
<?php

use App\Http\Controllers\EnrollmentController;
use Illuminate\Support\Facades\Route;

Route::post('enrollments', [EnrollmentController::class, 'store'])->name('enrollments.store');
Route::patch('enrollments/{enrollment}', [EnrollmentController::class, 'update'])->name('enrollments.update');
Route::delete('enrollments/{enrollment}', [EnrollmentController::class, 'destroy'])->name('enrollments.destroy');
```

## After Completion

Run:
```bash
php artisan wayfinder:generate --with-form
npm run build
```

Then say: **"Load the phase-6-fee-tracking skill"**
