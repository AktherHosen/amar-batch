---
name: phase-4-teacher-management
description: Phase 4 — Build teacher management: admin CRUD teachers, assign to batches, teacher profile. Run after Phase 3.
---

# Phase 4: Teacher Management

## Goal

Build teacher CRUD for admins and teacher profile management. Teachers are User records with role='teacher'.

## Prerequisites

- Phase 1 complete (User model with role column, teacher_batch pivot)
- Phase 3 complete (Batch CRUD with assign/remove teacher methods)

## Step 4.1: TeacherController

Create `app/Http/Controllers/TeacherController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTeacherRequest;
use App\Http\Requests\UpdateTeacherRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class TeacherController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $query = User::where('role', 'teacher');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $teachers = $query->withCount('assignedBatches')->latest()->paginate(15)->withQueryString();

        return Inertia::render('teachers/index', [
            'teachers' => $teachers,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('teachers/create');
    }

    public function store(StoreTeacherRequest $request): RedirectResponse
    {
        $this->authorize('create', User::class);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'teacher',
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Teacher created successfully.']);

        return to_route('teachers.index');
    }

    public function show(User $teacher): Response
    {
        $this->authorize('view', $teacher);

        $teacher->load(['assignedBatches.enrollments.student']);
        $teacher->loadCount('assignedBatches');

        return Inertia::render('teachers/show', [
            'teacher' => $teacher,
        ]);
    }

    public function edit(User $teacher): Response
    {
        $this->authorize('update', $teacher);

        return Inertia::render('teachers/edit', [
            'teacher' => $teacher,
        ]);
    }

    public function update(UpdateTeacherRequest $request, User $teacher): RedirectResponse
    {
        $this->authorize('update', $teacher);

        $data = $request->validated();

        // Only update password if provided
        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $teacher->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Teacher updated successfully.']);

        return to_route('teachers.show', $teacher);
    }

    public function destroy(User $teacher): RedirectResponse
    {
        $this->authorize('delete', $teacher);

        $teacher->update(['role' => 'inactive']);
        $teacher->assignedBatches()->detach();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Teacher deactivated successfully.']);

        return to_route('teachers.index');
    }
}
```

## Step 4.2: Form Requests

### `app/Http/Requests/StoreTeacherRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }
}
```

### `app/Http/Requests/UpdateTeacherRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->route('teacher'))],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ];
    }
}
```

## Step 4.3: Teachers List Page

Create `resources/js/pages/teachers/index.tsx`:

- Table: Name, Email, Assigned Batches Count, Actions
- Search input
- "Add Teacher" button (admin only)
- Edit/View actions (admin only)

## Step 4.4: Teacher Form Component

Create `resources/js/components/teacher-form.tsx`:

- Fields: name, email, password (optional on edit), password_confirmation
- Reusable for create/edit

## Step 4.5: Create/Edit Pages

Create `resources/js/pages/teachers/create.tsx` and `edit.tsx`

## Step 4.6: Teacher Detail Page

Create `resources/js/pages/teachers/show.tsx`:

- Teacher info card (name, email, role)
- Assigned batches list with student counts
- Quick actions: assign to batch, view batch details
- Admin-only: assign/remove batch buttons

## Step 4.7: Routes

Create `routes/teachers.php`:

```php
<?php

use App\Http\Controllers\TeacherController;
use Illuminate\Support\Facades\Route;

Route::resource('teachers', TeacherController::class);
```

Register in `routes/web.php`:
```php
require __DIR__.'/teachers.php';
```

## Step 4.8: Teacher Policy

Create `app/Policies/TeacherPolicy.php`:

```php
<?php

namespace App\Policies;

use App\Models\User;

class TeacherPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, User $teacher): bool
    {
        return $user->isAdmin() || $user->id === $teacher->id;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, User $teacher): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, User $teacher): bool
    {
        return $user->isAdmin();
    }
}
```

Register in `AuthServiceProvider`:

```php
protected $policies = [
    \App\Models\User::class => \App\Policies\TeacherPolicy::class,
];
```

## After Completion

Run:
```bash
php artisan migrate
php artisan wayfinder:generate --with-form
npm run build
```

Then say: **"Load the phase-5-enrollment skill"**
