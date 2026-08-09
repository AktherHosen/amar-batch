# Amar Batch - Coaching Center Management SaaS

A multi-tenant coaching center management platform built with Laravel 13 + Inertia.js 3 (React 19) with role-based access control.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 13 + PHP 8.3 |
| Frontend | React 19 + TypeScript 5.7 + Inertia.js 3 |
| UI | Tailwind CSS 4 + shadcn/ui (New York variant) |
| Charts | Chart.js + react-chartjs-2 |
| Auth | Laravel Fortify (passkeys, 2FA, password reset) |
| Routing | Wayfinder (auto-generated typed routes) |
| DB | MySQL |
| Testing | PHPUnit 12 |
| PWA | Service Worker + Manifest |
| Starter Kit | Laravel Chisel |

## Features

### Multi-Tenancy
- Full SaaS multi-tenancy with tenant isolation
- `BelongsToTenant` trait auto-scopes queries and auto-fills `tenant_id`
- Each tenant has its own subscription, users, students, batches, and data
- Super admin can view and manage all tenants

### Onboarding Flow
- New owner accounts go through `/onboarding` to create their tenant
- Auto-assigns a default plan with a 14-day trial subscription
- `OnboardingMiddleware` enforces completion before app access

### Super Admin Panel
- Separate layout and sidebar for super admin
- Global dashboard with cross-tenant stats (total tenants, users, students, batches)
- Tenant management: list, show, activate/deactivate
- Plan management: full CRUD for subscription plans

### Subscription/Plan System
- 4 tiers: Free Trial (default), Basic, Per-teacher, Enterprise
- Configurable limits: max students, max staff, max batches per plan
- Features array per plan (attendance, fees, exams, reports, notifications, custom branding, multi-branch, API access)

### Teacher Approval System
- Staff accounts require admin approval before accessing the app
- `CheckTeacherApproval` middleware blocks unapproved staff with a warning toast
- Admin can approve/reject teachers via dedicated routes
- Dashboard shows a pending-approval view for unapproved teachers

### Dashboard
- Role-based stat cards (admin sees all, teacher sees assigned batches only)
- Live clock with time and date (hidden on mobile, right-aligned)
- Interactive charts: Today's Attendance (doughnut), Enrollment Trend (bar), Fee Collection (line)
- Batch history card with recent activity
- Refresh button with spin animation

### Student Management
- Full CRUD with coaching class assignment
- Joined/left dates tracking
- Detail page with enrollment history, fee status, and attendance summary by month
- Dropdown actions (view/edit/delete)
- Sticky first column on index table
- Pagination with page numbers (10 per page)
- Teachers see only students enrolled in their assigned batches

### Batch Management
- Create batches with days/time schedule, capacity tracking
- Complete batch status (auto-completes all active enrollments)
- Batch history logging (enrollment/completion/removal actions)
- Assign/remove teachers to batches
- Enroll/remove students with capacity checks
- Status badges: active (default), inactive (danger), archived (secondary), completed (success/green)
- Dropdown actions on index and show pages
- Show page: responsive grid cards for info, batch name in heading

### Teacher Management
- Admin CRUD, assign teachers to batches
- Approve/reject teacher accounts
- Detail page with assigned batches and enrolled students
- Dropdown actions (view/edit/delete)
- Sticky first column on index table

### Coaching Classes
- Define class names with default fees
- Dropdown actions (edit/delete)
- Pagination with page numbers

### Enrollment System
- Connect students to batches with duplicate and capacity checks
- Selectable enrollment date
- Update enrollment status (active/completed/dropped)
- History logging with action dates

### Fee Tracking
- Monthly grid view: students x months matrix for selected year
- Year selector, student search
- Create/edit individual fee records
- Sticky first column on wide fee grid table
- Dropdown for header menu, direct delete button

### Attendance
- Bulk marking via create page (batch select + date in flex row)
- Single record edit (status + notes)
- Dropdown actions (edit/delete) on index
- Sticky first column on index table
- Completed batches filtered from dropdown

### Authentication
- Email verification (configurable)
- Registration (can be toggled off via `install:features`)
- Two-factor authentication (2FA) with setup modal and recovery codes
- Passkey authentication with register/verify flows
- Password confirmation for secure areas
- Password reset via email

### UI/UX
- ConfirmDialog + sonner toast across all pages
- Tables: sticky first column, whitespace-nowrap on headers/cells
- EllipsisVertical (vertical three dots) for multi-action dropdowns
- Search bars: X icon to reset, RefreshCw icon with spin animation on click
- Pagination: shadcn-style with page numbers, 10 records per page
- Badge variants: success (green-600), danger (red-600)
- Button destructive variant: bg-red-600 text-white
- Light/dark/system theme toggle

### Internationalization
- Full English + Bangla (Bengali) locale support
- Language switcher component
- Bangla digit conversion, currency formatting, date formatting

### PWA
- Service worker with offline support
- Web app manifest for installability
- Offline page with retry button

## RBAC Roles

| Role | Access |
|------|--------|
| Super Admin | Global access — manage tenants, plans, view cross-tenant stats |
| Owner (Admin) | Full tenant access — manage all students, teachers, batches, fees, attendance |
| Staff (Teacher) | View assigned batches, mark attendance, view fees (read-only). Requires approval. |

## Setup

### Prerequisites
- PHP 8.3+
- MySQL 5.7+ or MariaDB 10.3+
- Composer
- Node.js 18+ & npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd academia

# Install PHP dependencies
composer install

# Install JS dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Create the database (update DB_DATABASE in .env to `amar_batch`)
# Then run migrations and seed
php artisan migrate:fresh --seed

# Generate Wayfinder typed routes
php artisan wayfinder:generate --with-form

# Build frontend assets
npm run build

# Start development server
php artisan serve
```

### Feature Configuration

Toggle optional features interactively:

```bash
php artisan install:features
```

This lets you enable/disable: email verification, registration, 2FA, passkeys, password confirmation. It removes unused files and rebuilds assets.

### Creating Admin Users

```bash
php artisan make:admin --create                  # Create new owner interactively
php artisan make:admin user@example.com          # Promote existing user to owner
php artisan make:admin --create admin@example.com  # Create with specific email
```

## Commands

```bash
php artisan migrate                        # Run all migrations
php artisan migrate:fresh --seed           # Reset and seed
php artisan migrate:rollback               # Rollback last batch
php artisan db:seed                         # Seed all tables
php artisan db:seed --class=AdminSeeder     # Seed admin only
php artisan db:seed --class=TeacherSeeder   # Seed teachers only
php artisan db:seed --class=StudentSeeder   # Seed students only
php artisan install:features               # Toggle optional features
php artisan make:admin                      # Create/promote admin
php artisan wayfinder:generate --with-form  # Regenerate typed routes
```

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@amarbatch.com | password |
| Owner (Admin) | admin@amarbatch.com | password |
| Teacher | john@amarbatch.com | password |
| Teacher | sarah@amarbatch.com | password |

## Routes

### Public
| Route | Description |
|-------|-------------|
| `GET /` | Landing page (welcome) |

### Auth
| Route | Description |
|-------|-------------|
| `GET /login` | Login page |
| `GET /register` | Registration page |
| `GET /forgot-password` | Password reset request |
| `GET /reset-password/{token}` | Password reset form |
| `GET /verify-email` | Email verification notice |

### Tenant (requires auth + tenant + onboarding)
| Route | Description |
|-------|-------------|
| `GET /dashboard` | Dashboard (role-aware) |
| `GET /students` | Student management |
| `GET /teachers` | Teacher management (admin) |
| `GET /batches` | Batch management |
| `GET /coaching-classes` | Coaching class management |
| `GET /fees` | Fee tracking (admin) |
| `GET /attendance` | Attendance management |
| `GET /settings/profile` | Profile settings |
| `GET /settings/security` | Security settings (2FA, passkeys) |
| `GET /settings/appearance` | Theme settings |
| `GET /onboarding` | Tenant onboarding (owners only) |

### Super Admin
| Route | Description |
|-------|-------------|
| `GET /super-admin/dashboard` | Global admin dashboard |
| `GET /super-admin/tenants` | Tenant management |
| `GET /super-admin/plans` | Plan management |

## Project Structure

```
app/
├── Concerns/                  # Shared traits (BelongsToTenant, validation rules)
├── Console/Commands/          # Artisan commands (make:admin, install:features)
├── Http/
│   ├── Controllers/           # Backend controllers (16 total)
│   │   └── SuperAdmin/        # Super admin controllers
│   ├── Middleware/             # Tenant, Role, Onboarding, TeacherApproval
│   └── Requests/              # Form request validation (16 total)
├── Models/                    # Eloquent models (11 total)
├── Policies/                  # Authorization policies (4)
database/
├── migrations/                # Database migrations
├── seeders/                   # Database seeders (8 total)
├── factories/                 # Model factories
routes/
├── web.php                    # Master router
├── students.php               # Student routes
├── batches.php                # Batch routes (+ enrollments)
├── teachers.php               # Teacher routes (+ approve/reject)
├── fees.php                   # Fee routes
├── attendance.php             # Attendance routes
├── classes.php                # Coaching class routes
├── settings.php               # Settings routes
├── super-admin.php            # Super admin routes
└── onboarding.php             # Onboarding routes
resources/
├── js/
│   ├── pages/                 # Inertia.js pages (40 total)
│   ├── components/            # React components (65+ total)
│   │   └── ui/                # shadcn/ui components
│   ├── contexts/              # Locale context (EN/BN)
│   ├── hooks/                 # Custom React hooks
│   ├── layouts/               # Layout components (7 total)
│   ├── routes/                # Wayfinder typed routes
│   └── types/                 # TypeScript types
public/
├── build/                     # Compiled assets
├── sw.js                      # Service worker
└── manifest.json              # PWA manifest
```

## Models

| Model | Description |
|-------|-------------|
| User | Authentication + role (super_admin/owner/staff/student/parent) |
| Tenant | Multi-tenant organization with subscription |
| Student | Student profiles with coaching class |
| Batch | Class batches with days/time schedule |
| CoachingClass | Class definitions with default fees |
| Enrollment | Student-batch relationships |
| FeeStatus | Monthly fee tracking records |
| Attendance | Daily attendance records |
| BatchHistory | Batch action audit trail (enrollment/completion/removal) |
| Plan | Subscription plan tiers with limits |
| Subscription | Tenant-plan binding with trial dates |

## Testing

```bash
php artisan test                       # Run all tests
php artisan test --filter=Student      # Run specific model tests
php artisan test --filter=Batch        # Run batch tests
php artisan test --filter=Dashboard    # Run dashboard tests
php artisan test --filter=Auth         # Run auth tests
```

## License

MIT
