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
            'class_name' => ['nullable', 'string', 'max:100'],
            'section' => ['nullable', 'string', 'max:10'],
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
        // ... same table structure with columns:
        // Name, Email, Phone, Class, Status, Enrollments, Actions
        // Class column shows: {student.class_name} {student.section}
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

Create `resources/js/components/student-form.tsx`:

```tsx
import { Form } from '@inertiajs/react';
import StudentController from '@/actions/App/Http/Controllers/StudentController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Student } from '@/types';

type StudentFormProps = { student?: Student; mode: 'create' | 'edit' };

export default function StudentForm({ student, mode }: StudentFormProps) {
    const formAction = mode === 'edit'
        ? StudentController.update.form(student!.id)
        : StudentController.store.form();

    return (
        <Form {...formAction} options={{ preserveScroll: true }} className="space-y-6">
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input id="name" name="name" defaultValue={student?.name} required placeholder="Full name" />
                            <InputError message={errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" defaultValue={student?.email} placeholder="Email address" />
                            <InputError message={errors.email} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" defaultValue={student?.phone} placeholder="Phone number" />
                            <InputError message={errors.phone} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="class_name">Class / Grade</Label>
                            <Input id="class_name" name="class_name" defaultValue={student?.class_name} placeholder="e.g. Class 10, B.Tech 2nd Year" />
                            <InputError message={errors.class_name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="section">Section</Label>
                            <Input id="section" name="section" defaultValue={student?.section} placeholder="e.g. A, B" />
                            <InputError message={errors.section} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date_of_birth">Date of Birth</Label>
                            <Input id="date_of_birth" name="date_of_birth" type="date" defaultValue={student?.date_of_birth} />
                            <InputError message={errors.date_of_birth} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Gender</Label>
                            <Select name="gender" defaultValue={student?.gender}>
                                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.gender} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select name="status" defaultValue={student?.status || 'active'}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status} />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="guardian_name">Guardian Name</Label>
                            <Input id="guardian_name" name="guardian_name" defaultValue={student?.guardian_name} placeholder="Guardian name" />
                            <InputError message={errors.guardian_name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="guardian_phone">Guardian Phone</Label>
                            <Input id="guardian_phone" name="guardian_phone" defaultValue={student?.guardian_phone} placeholder="Guardian phone" />
                            <InputError message={errors.guardian_phone} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" name="address" defaultValue={student?.address} placeholder="Full address" />
                        <InputError message={errors.address} />
                    </div>
                    <div className="flex items-center gap-4">
                        <Button disabled={processing} data-test="save-student-button">
                            {mode === 'create' ? 'Create Student' : 'Update Student'}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
```

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

## Step 2.9: Add Student Type to TypeScript

Add to `resources/js/types/index.ts`:

```typescript
export type Student = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    class_name: string | null;
    section: string | null;
    address: string | null;
    date_of_birth: string | null;
    gender: 'male' | 'female' | 'other' | null;
    guardian_name: string | null;
    guardian_phone: string | null;
    photo: string | null;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
};
```

## After Completion

Run:
```bash
php artisan migrate
php artisan wayfinder:generate --with-form
npm run build
```

Then say: **"Load the phase-3-batch-management skill"**
