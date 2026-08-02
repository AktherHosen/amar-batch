---
name: phase-7-attendance
description: Phase 7 — Build attendance: teacher marks for assigned batches, student views own, admin views all. Run after Phase 6.
---

# Phase 7: Attendance

## Goal

Track daily attendance with teacher marking for assigned batches, student self-view, and admin oversight.

## Prerequisites

- Phase 1 complete (Attendance model with marked_by FK)

## Step 7.1: AttendanceController with RBAC

Create `app/Http/Controllers/AttendanceController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Batch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function mark(Batch $batch, Request $request): Response
    {
        // Only admin or assigned teacher can mark
        $this->authorize('manageStudents', $batch);

        $date = $request->input('date', now()->toDateString());

        $students = $batch->students()->where('enrollments.status', 'active')->get();

        $existingAttendance = Attendance::where('batch_id', $batch->id)
            ->where('date', $date)
            ->pluck('status', 'student_id')
            ->toArray();

        return Inertia::render('attendance/mark', [
            'batch' => $batch,
            'students' => $students,
            'date' => $date,
            'existingAttendance' => $existingAttendance,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'batch_id' => 'required|exists:batches,id',
            'date' => 'required|date',
            'attendance' => 'required|array',
            'attendance.*.student_id' => 'required|exists:students,id',
            'attendance.*.status' => 'required|in:present,absent,late',
        ]);

        $batch = Batch::findOrFail($validated['batch_id']);
        $this->authorize('manageStudents', $batch);

        foreach ($validated['attendance'] as $record) {
            Attendance::updateOrCreate(
                [
                    'student_id' => $record['student_id'],
                    'batch_id' => $validated['batch_id'],
                    'date' => $validated['date'],
                ],
                [
                    'status' => $record['status'],
                    'marked_by' => $request->user()->id,
                ]
            );
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Attendance saved successfully.']);

        return to_route('attendance.mark', $validated['batch_id']);
    }

    public function history(Batch $batch, Request $request): Response
    {
        $this->authorize('view', $batch);

        $attendances = Attendance::with('student')
            ->where('batch_id', $batch->id)
            ->latest('date')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('attendance/history', [
            'batch' => $batch,
            'attendances' => $attendances,
        ]);
    }

    public function studentReport(Request $request, $studentId): Response
    {
        $student = \App\Models\Student::findOrFail($studentId);

        // Students can only view own report
        if ($request->user()->isStudent() && $request->user()->student_id !== (int) $studentId) {
            abort(403);
        }

        $attendances = Attendance::where('student_id', $studentId)
            ->with('batch')
            ->latest('date')
            ->paginate(30);

        $stats = [
            'total' => Attendance::where('student_id', $studentId)->count(),
            'present' => Attendance::where('student_id', $studentId)->where('status', 'present')->count(),
            'absent' => Attendance::where('student_id', $studentId)->where('status', 'absent')->count(),
            'late' => Attendance::where('student_id', $studentId)->where('status', 'late')->count(),
        ];

        return Inertia::render('attendance/student-report', [
            'student' => $student,
            'attendances' => $attendances,
            'stats' => $stats,
        ]);
    }

    // Admin/Teacher: view any student report
    // Student: view own report only
    public function myReport(Request $request): Response
    {
        $studentId = $request->user()->student_id;

        if (!$studentId) {
            abort(403);
        }

        return $this->studentReport($request, $studentId);
    }
}
```

## Step 7.2: Mark Attendance Page

Create `resources/js/pages/attendance/mark.tsx`:

- Header: Batch name + date picker
- Table: Student name + Present/Absent/Late radio buttons
- Pre-fill if attendance already exists
- "Save Attendance" button
- Only visible to admin/assigned teacher

## Step 7.3: Attendance History Page

Create `resources/js/pages/attendance/history.tsx`:

- Filter by month
- Table: Date, Student, Status badge
- Attendance percentage summary

## Step 7.4: Student Attendance Report

Create `resources/js/pages/attendance/student-report.tsx`:

- Stats: total classes, present/absent/late counts, percentage
- Monthly breakdown
- Record list

## Step 7.5: Routes

Create `routes/attendance.php`:

```php
<?php

use App\Http\Controllers\AttendanceController;
use Illuminate\Support\Facades\Route;

Route::get('batches/{batch}/attendance', [AttendanceController::class, 'mark'])->name('attendance.mark');
Route::post('attendance', [AttendanceController::class, 'store'])->name('attendance.store');
Route::get('batches/{batch}/attendance/history', [AttendanceController::class, 'history'])->name('attendance.history');
Route::get('students/{student}/attendance', [AttendanceController::class, 'studentReport'])->name('attendance.student-report');
Route::get('my-attendance', [AttendanceController::class, 'myReport'])->name('attendance.my-report');
```

## After Completion

Run:
```bash
php artisan wayfinder:generate --with-form
npm run build
```

Then say: **"Load the phase-8-dashboard-navigation skill"**
