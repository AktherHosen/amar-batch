---
name: coaching-system-overview
description: Master overview for the Amar Batch Coaching Management System with RBAC. Load this first for full project context, tech stack, roles, and build order.
---

# Coaching Management System — Overview

## Project Context

Amar Batch is a multi-tenant coaching center management SaaS with role-based access control built with:

- **Backend:** Laravel 13 + PHP 8.3
- **Frontend:** React 19 + TypeScript 5.7 + Inertia.js 3
- **UI:** Tailwind CSS 4 + shadcn/ui (New York variant)
- **Auth:** Laravel Fortify (passkeys, 2FA, password reset)
- **Routing:** Wayfinder (auto-generated typed routes)
- **DB:** MySQL (database: `amar_batch`)
- **Testing:** PHPUnit 12
- **PWA:** Service worker, manifest, offline page
- **Localization:** Bangla language switcher support
- **Starter Kit:** Laravel Chisel

## What Exists Already

- Full authentication system (login, register, 2FA, passkeys, password reset)
- Profile management (edit name/email, delete account, password change)
- Settings pages (profile, security, appearance)
- Role-based dashboard (super admin, owner/admin, staff/teacher)
- Collapsible sidebar layout with navigation
- shadcn/ui component library (65+ components)
- Theme system (light/dark/system)
- Modern responsive landing page with dynamic stats
- PWA support (service worker, manifest, offline page)
- Bangla localization with language switcher
- Multi-tenancy with tenant isolation
- Onboarding flow for new tenants
- Super admin panel with global stats
- Subscription/plan system
- Teacher approval workflow
- Batch history/audit trail

## RBAC — Three Main Roles

### Super Admin
- Global access across all tenants
- Manage tenants (activate/deactivate)
- Manage subscription plans (CRUD)
- View cross-tenant statistics

### Owner (Admin)
- Full tenant access
- Manage all students, teachers, batches, coaching classes, fees, attendance
- Assign teachers to batches
- Approve/reject teacher accounts
- View tenant dashboard and reports
- Manage subscription (view)

### Staff (Teacher)
- View assigned batches and enrolled students
- Mark attendance for assigned batches
- View attendance history for their batches
- View fee status of students in their batches (read-only)
- Requires admin approval before accessing the app
- Cannot create/delete batches or manage fees

## Data Model (with RBAC)

```
tenants (multi-tenant organizations)
├── name, slug, email, phone, address, logo, timezone, currency, is_active
│
users (authentication + role + tenant)
├── role: enum (super_admin, owner, staff, student, parent, inactive)
├── tenant_id: FK → tenants (null for super_admin)
├── is_approved: boolean (staff requires approval)
├── onboarding_complete: boolean (owners must complete onboarding)
│
plans (subscription tiers)
├── name, slug, description, price_monthly, price_yearly
├── max_students, max_staff, max_batches, features
│
subscriptions (tenant-plan binding)
├── tenant_id, plan_id, status, trial_ends_at, ends_at
│
coaching_classes (coaching class definitions)
├── tenant_id, name, default_fee
│
students (coaching-specific data)
├── tenant_id, name, phone, coaching_class_id (FK → coaching_classes)
├── section, address, date_of_birth, gender
├── guardian_name, guardian_phone, photo
├── status (active/inactive), joined_at, left_at
│
batches (class batches)
├── tenant_id, name, subject, days (string), time (string), capacity
├── start_date, end_date, status (active/inactive/archived)
│
teacher_batch (pivot — assigns teachers to batches)
├── teacher_id (FK → users where role=staff)
├── batch_id (FK → batches)
│
enrollments (pivot — enrolls students in batches)
├── tenant_id, student_id, batch_id, status, enrolled_at
│
fee_statuses (monthly fee tracking)
├── tenant_id, student_id, batch_id, month (int), year (int)
├── amount_paid, notes
│
attendances (daily attendance)
├── tenant_id, student_id, batch_id, marked_by (FK → users), date
├── status (present/absent/late), notes
│
batch_history (audit trail)
├── tenant_id, batch_id, student_id, action, action_date, user_id, notes
```

## Codebase Conventions

### File Locations
- Controllers: `app/Http/Controllers/`
- Super Admin Controllers: `app/Http/Controllers/SuperAdmin/`
- Form Requests: `app/Http/Requests/`
- Models: `app/Models/`
- Policies: `app/Policies/`
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
- Use `BelongsToTenant` trait on all tenant models

### RBAC Conventions
- Check auth user role: `auth()->user()->role`
- Super admin: `role:super_admin`
- Owner/Staff middleware: handled by `TenantMiddleware` + `CheckTeacherApproval`
- Create Policies for each model (StudentPolicy, BatchPolicy, etc.)
- Gate::define('role', fn($user, $role) => in_array($user->role, (array) $role))

### Multi-Tenancy Conventions
- Always use `BelongsToTenant` trait on new models
- Never hardcode `tenant_id` — the trait handles it
- Tenant is set in the container by `TenantMiddleware`
- Super admin bypasses tenant scoping

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
php artisan install:features    # Toggle optional auth features
php artisan make:admin          # Create/promote admin
```
