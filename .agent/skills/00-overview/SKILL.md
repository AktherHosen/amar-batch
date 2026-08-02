---
name: coaching-system-overview
description: Master overview for the Academia Coaching Management System with RBAC. Load this first for full project context, tech stack, roles, and build order.
---

# Coaching Management System — Overview

## Project Context

Academia is a coaching center management system with role-based access control built with:

- **Backend:** Laravel 13 + PHP 8.3
- **Frontend:** React 19 + TypeScript 5.7 + Inertia.js 3
- **UI:** Tailwind CSS 4 + shadcn/ui (New York variant)
- **Auth:** Laravel Fortify (already set up)
- **Routing:** Wayfinder (auto-generated typed routes)
- **DB:** MySQL (database: `academia`)
- **Testing:** PHPUnit 12

## What Exists Already

- Full authentication system (login, register, 2FA, passkeys, password reset)
- Profile management (edit name/email, delete account, password change)
- Settings pages (profile, security, appearance)
- Dashboard placeholder page
- Collapsible sidebar layout with navigation
- shadcn/ui component library (26 components)
- Theme system (light/dark/system)

## RBAC — Three Roles

### Admin
- Full access to everything
- Manage all students, teachers, batches, fees, attendance
- Assign teachers to batches
- View all reports and dashboards
- Manage system settings

### Teacher
- Manage students in assigned batches only
- Mark attendance for assigned batches
- View attendance history for their batches
- View fee status of students in their batches (read-only)
- Cannot create/delete batches or manage fees

### Student
- View own profile and enrolled batches
- View own attendance history
- View own fee status
- Cannot manage anything

## Data Model (with RBAC)

```
users (authentication + role)
├── role: enum (admin, teacher, student)
├── student_id: nullable FK → students (links user to student record)
│
students (coaching-specific data)
├── name, email, phone, address, DOB, gender, guardian info, status
│
batches
├── name, subject, schedule, capacity, fees, dates, status
│
teacher_batch (pivot — assigns teachers to batches)
├── teacher_id (FK → users where role=teacher)
├── batch_id (FK → batches)
│
enrollments (pivot — enrolls students in batches)
├── student_id, batch_id, status, enrolled_at
│
fee_statuses
├── student_id, batch_id, amount_paid, amount_due, status, due_date
│
attendances
├── student_id, batch_id, date, status (present/absent/late)
```

## Build Order

```
Phase 1: Database & Core Models      (foundation + RBAC schema)
Phase 2: Student Management          (admin CRUD, teacher view)
Phase 3: Batch Management            (admin CRUD, teacher assignment)
Phase 4: Teacher Management          (admin CRUD, assign to batches)
Phase 5: Enrollment System           (connect students + batches)
Phase 6: Fee Tracking                (admin-only financial layer)
Phase 7: Attendance                  (teacher marks, student views)
Phase 8: Dashboard & Navigation      (role-based sidebar + stats)
Phase 9: Polish & Production         (seeders, tests, export)
```

## Codebase Conventions

### File Locations
- Controllers: `app/Http/Controllers/`
- Form Requests: `app/Http/Requests/`
- Models: `app/Models/`
- Migrations: `database/migrations/`
- React Pages: `resources/js/pages/`
- Reusable Components: `resources/js/components/`
- Route Files: `routes/` (registered in `routes/web.php`)

### Patterns
- Use `Inertia::render('page-name', [...])` for page responses
- Use `Inertia::flash('toast', ['type' => 'success', 'message' => '...'])` for flash messages
- Use `data-test` attributes on interactive elements
- Use Wayfinder typed routes: `import { index } from '@/routes/students'`
- Use shadcn/ui components from `@/components/ui/`
- Use `cn()` from `@/lib/utils` for conditional classes
- Pages declare layout via `Page.layout = { breadcrumbs: [...] }`
- Use Form Requests for validation
- Use Laravel Policies for authorization
- Use `$this->authorize('action', Model::class)` in controllers

### RBAC Conventions
- Check auth user role: `auth()->user()->role`
- Use middleware: `->middleware('role:admin')` or `->middleware('role:admin,teacher')`
- Create Policies for each model (StudentPolicy, BatchPolicy, etc.)
- Gate::define('role', fn($user, $role) => in_array($user->role, (array) $role))

### Commands
```bash
php artisan make:migration create_students_table
php artisan make:model Student -mfr
php artisan make:controller StudentController --resource
php artisan make:request StoreStudentRequest
php artisan make:policy StudentPolicy --model=Student
php artisan make:factory StudentFactory
php artisan migrate
php artisan test
npm run build
php artisan wayfinder:generate --with-form
```
