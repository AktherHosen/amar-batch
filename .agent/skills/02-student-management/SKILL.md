---
name: phase-2-student-management
description: Phase 2 — Build student management with RBAC: admin full CRUD, teacher view assigned students, student view own profile. Run after Phase 1.
---

# Phase 2: Student Management

## Goal

Build student CRUD with role-based access: admins manage all, teachers view assigned, students view own.

## Prerequisites

- Phase 1 complete (User model with role, Student model, policies, RoleMiddleware)

## Step 2.1: StudentController with RBAC

Create `app/Http/Controllers/StudentController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Student::class);

        $query = Student::query();

        // Teachers see only students in their assigned batches
        if ($request->user()->isTeacher()) {
            $studentIds = $request->user()->assignedBatches()
                ->whereHas('enrollments', fn($q) => $q->where('status', 'active'))
                ->pluck('enrollments.student_id')
                ->unique();
            $query->whereIn('students.id', $studentIds);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $students = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('students/index', [
            'students' => $students,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Student::class);

        return Inertia::render('students/create');
    }

    public function store(StoreStudentRequest $request): RedirectResponse
    {
        $this->authorize('create', Student::class);

        Student::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Student created successfully.']);

        return to_route('students.index');
    }

    public function show(Student $student): Response
    {
        $this->authorize('view', $student);

        $student->load(['enrollments.batch', 'feeStatuses.batch', 'attendances']);

        return Inertia::render('students/show', [
            'student' => $student,
        ]);
    }

    public function edit(Student $student): Response
    {
        $this->authorize('update', $student);

        return Inertia::render('students/edit', [
            'student' => $student,
        ]);
    }

    public function update(UpdateStudentRequest $request, Student $student): RedirectResponse
    {
        $this->authorize('update', $student);

        $student->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Student updated successfully.']);

        return to_route('students.show', $student);
    }

    public function destroy(Student $student): RedirectResponse
    {
        $this->authorize('delete', $student);

        $student->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Student deleted successfully.']);

        return to_route('students.index');
    }
}
```

## Step 2.2: Form Requests

Same as before but only admins can create/edit:

### `app/Http/Requests/StoreStudentRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:students,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'in:male,female,other'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_phone' => ['nullable', 'string', 'max:20'],
            'status' => ['sometimes', 'in:active,inactive'],
        ];
    }
}
```

### `app/Http/Requests/UpdateStudentRequest.php`

Same pattern with `Rule::unique('students', 'email')->ignore($this->route('student'))` and `authorize()` returning `$this->user()->isAdmin()`.

## Step 2.3: Students List Page

Create `resources/js/pages/students/index.tsx`:

- Same as before but add role-based conditional rendering:
  - Show "Add Student" button only for admins
  - Show edit/delete actions only for admins
  - Teachers see a read-only view

```tsx
import { usePage } from '@inertiajs/react';
// ... other imports

type PageProps = {
    auth: { user: { role: string } };
};

export default function StudentsIndex({ students, filters }) {
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';

    return (
        // ... same table structure
        // Conditionally render admin-only buttons
        {isAdmin && (
            <Link href={students.create()}>
                <Button><Plus className="mr-2 size-4" /> Add Student</Button>
            </Link>
        )}
        // In table rows, conditionally show edit
        {isAdmin && (
            <Link href={students.edit(student.id)}>
                <Button variant="ghost" size="sm">Edit</Button>
            </Link>
        )}
    );
}
```

## Step 2.4: Student Form Component

Create `resources/js/components/student-form.tsx` — same as before, only used in admin create/edit pages.

## Step 2.5: Create/Edit Pages

Create `resources/js/pages/students/create.tsx` and `edit.tsx` — same as before, admin-only routes.

## Step 2.6: Student Detail Page

Create `resources/js/pages/students/show.tsx` — same as before, with role-based action buttons.

## Step 2.7: Routes

Create `routes/students.php`:

```php
<?php

use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;

Route::resource('students', StudentController::class);
```

Register in `routes/web.php`.

## After Completion

Run:
```bash
php artisan migrate
php artisan wayfinder:generate --with-form
npm run build
```

Then say: **"Load the phase-3-batch-management skill"**
