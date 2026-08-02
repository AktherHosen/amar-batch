---
name: phase-3-batch-management
description: Phase 3 — Build batch management with RBAC: admin CRUD, teacher sees assigned batches, student sees enrolled batches. Run after Phase 2.
---

# Phase 3: Batch Management

## Goal

Build batch CRUD with role-based access and teacher assignment UI.

## Prerequisites

- Phase 2 complete (Student CRUD with RBAC)

## Step 3.1: BatchController with RBAC

Create `app/Http/Controllers/BatchController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBatchRequest;
use App\Http\Requests\UpdateBatchRequest;
use App\Models\Batch;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BatchController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Batch::class);

        $query = Batch::withCount('enrollments');

        // Teachers see only assigned batches
        if ($request->user()->isTeacher()) {
            $query->whereHas('teachers', fn($q) => $q->where('users.id', $request->user()->id));
        }

        // Students see only enrolled batches
        if ($request->user()->isStudent()) {
            $query->whereHas('enrollments', fn($q) => $q->where('student_id', $request->user()->student_id));
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $batches = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('batches/index', [
            'batches' => $batches,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Batch::class);

        return Inertia::render('batches/create');
    }

    public function store(StoreBatchRequest $request): RedirectResponse
    {
        $this->authorize('create', Batch::class);

        Batch::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Batch created successfully.']);

        return to_route('batches.index');
    }

    public function show(Batch $batch): Response
    {
        $this->authorize('view', $batch);

        $batch->load(['enrollments.student', 'teachers']);

        $teachers = User::where('role', 'teacher')->get();

        return Inertia::render('batches/show', [
            'batch' => $batch,
            'teachers' => $teachers,
        ]);
    }

    public function edit(Batch $batch): Response
    {
        $this->authorize('update', $batch);

        return Inertia::render('batches/edit', [
            'batch' => $batch,
        ]);
    }

    public function update(UpdateBatchRequest $request, Batch $batch): RedirectResponse
    {
        $this->authorize('update', $batch);

        $batch->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Batch updated successfully.']);

        return to_route('batches.show', $batch);
    }

    public function destroy(Batch $batch): RedirectResponse
    {
        $this->authorize('delete', $batch);

        $batch->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Batch deleted successfully.']);

        return to_route('batches.index');
    }

    public function assignTeacher(Request $request, Batch $batch): RedirectResponse
    {
        $this->authorize('update', $batch);

        $request->validate([
            'teacher_id' => 'required|exists:users,id',
        ]);

        $teacher = User::findOrFail($request->teacher_id);

        if ($teacher->role !== 'teacher') {
            abort(422, 'Selected user is not a teacher.');
        }

        $batch->teachers()->syncWithoutDetaching([
            $teacher->id => ['assigned_at' => now()],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Teacher assigned successfully.']);

        return back();
    }

    public function removeTeacher(Request $request, Batch $batch): RedirectResponse
    {
        $this->authorize('update', $batch);

        $request->validate([
            'teacher_id' => 'required|exists:users,id',
        ]);

        $batch->teachers()->detach($request->teacher_id);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Teacher removed from batch.']);

        return back();
    }
}
```

## Step 3.2: Form Requests

Same pattern as Phase 2 with `authorize()` returning `$this->user()->isAdmin()`.

## Step 3.3: Batches List Page

Create `resources/js/pages/batches/index.tsx`:

- Role-based rendering:
  - Admin: sees all batches with full actions
  - Teacher: sees assigned batches (read + manage students)
  - Student: sees enrolled batches (read-only)
- Status badges, capacity indicators, search, filter

## Step 3.4: Batch Form

Create `resources/js/components/batch-form.tsx` — admin-only create/edit.

## Step 3.5: Batch Detail Page

Create `resources/js/pages/batches/show.tsx`:

- Admin: full info + teacher assignment section + enroll student
- Teacher: batch info + enrolled students + mark attendance button
- Student: batch info + own attendance + fee status

### Teacher Assignment Section (admin-only)

```tsx
// In batch show page
{isAdmin && (
    <Card>
        <CardHeader>
            <CardTitle>Assigned Teachers</CardTitle>
        </CardHeader>
        <CardContent>
            {/* List of assigned teachers with remove button */}
            {/* Add teacher dropdown */}
        </CardContent>
    </Card>
)}
```

## Step 3.6: Routes

Create `routes/batches.php`:

```php
<?php

use App\Http\Controllers\BatchController;
use Illuminate\Support\Facades\Route;

Route::resource('batches', BatchController::class);
Route::post('batches/{batch}/assign-teacher', [BatchController::class, 'assignTeacher'])->name('batches.assign-teacher');
Route::delete('batches/{batch}/remove-teacher', [BatchController::class, 'removeTeacher'])->name('batches.remove-teacher');
```

## After Completion

Run:
```bash
php artisan migrate
php artisan wayfinder:generate --with-form
npm run build
```

Then say: **"Load the phase-4-teacher-management skill"**
