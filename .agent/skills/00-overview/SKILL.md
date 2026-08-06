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
- **Auth:** Laravel Fortify (passkeys, 2FA, password reset)
- **Routing:** Wayfinder (auto-generated typed routes)
- **DB:** MySQL (database: `academia`)
- **Testing:** PHPUnit 12
- **PWA:** Service worker, manifest, offline page
- **Localization:** Bangla language switcher support

## What Exists Already

- Full authentication system (login, register, 2FA, passkeys, password reset)
- Profile management (edit name/email, delete account, password change)
- Settings pages (profile, security, appearance)
- Role-based dashboard (admin + teacher)
- Collapsible sidebar layout with navigation
- shadcn/ui component library (26+ components)
- Theme system (light/dark/system)
- Modern responsive landing page with dynamic stats
- PWA support (service worker, manifest, offline page)
- Bangla localization with language switcher

## RBAC — Three Roles

### Admin
- Full access to everything
- Manage all students, teachers, batches, coaching classes, fees, attendance
- Assign teachers to batches
- View all reports and dashboards
- Manage system settings
- CSV export for students and attendance

### Teacher
- View assigned batches and enrolled students
- Mark attendance for assigned batches
- View attendance history for their batches
- View fee status of students in their batches (read-only)
- Cannot create/delete batches or manage fees

### Student
- (No student user accounts in current implementation)
- Students are records managed by admin/teacher only

## Data Model (with RBAC)

```
users (authentication + role)
├── role: enum (admin, teacher)
├── student_id: nullable FK → students (not used in current implementation)
│
coaching_classes (coaching class definitions)
├── name, default_fee
│
students (coaching-specific data)
├── name, phone, coaching_class_id (FK → coaching_classes), section, address
├── date_of_birth, gender, guardian_name, guardian_phone, photo
├── status (active/inactive), joined_at, left_at
│
batches (class batches)
├── name, subject, days (string), time (string), capacity
├── start_date, end_date, status (active/inactive/archived)
│
teacher_batch (pivot — assigns teachers to batches)
├── teacher_id (FK → users where role=teacher)
├── batch_id (FK → batches)
│
enrollments (pivot — enrolls students in batches)
├── student_id, batch_id, status, enrolled_at
│
fee_statuses (monthly fee tracking)
├── student_id, batch_id, month (int), year (int)
├── amount_paid, notes
│
attendances (daily attendance)
├── student_id, batch_id, marked_by (FK → users), date
├── status (present/absent/late), notes
```

## Build Order

```
Phase 1: Database & Core Models      (foundation + RBAC schema + CoachingClass)
Phase 2: Student Management          (admin CRUD, teacher view)
Phase 3: Batch Management            (admin CRUD, teacher assignment, days/time)
Phase 4: Teacher Management          (admin CRUD, assign to batches)
Phase 5: Enrollment System           (connect students + batches)
Phase 6: Fee Tracking                (monthly tracking, admin-only writes)
Phase 7: Attendance                  (teacher marks, student views)
Phase 8: Dashboard & Navigation      (role-based sidebar + stats)
Phase 9: Coaching Classes            (CRUD for coaching class definitions)
Phase 10: Polish & Production        (seeders, tests, export, PWA, landing page)
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
