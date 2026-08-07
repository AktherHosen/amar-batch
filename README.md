# Academia - Coaching Management System

A Laravel + Inertia.js application for managing coaching centers with role-based access control (RBAC).

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

## Features

### Dashboard
- Role-based stat cards (admin sees all, teacher sees assigned)
- Live clock with time and date (hidden on mobile, right-aligned)
- Interactive charts: Today's Attendance (doughnut), Enrollment Trend (bar), Fee Collection (line)
- Batch history card with recent activity
- Refresh button with spin animation

### Student Management
- Full CRUD with coaching class assignment
- Joined/left dates tracking
- Detail page with batch info cards (matching batch detail style)
- Dropdown actions (view/edit/delete)
- Sticky first column on index table
- Pagination with page numbers (10 per page)

### Batch Management
- Create batches with days/time schedule, capacity tracking
- Complete batch status (auto-completes enrollments)
- Batch history logging (enrollment/completion/removal actions)
- Status badges: active (default), inactive (danger), archived (secondary), completed (success/green)
- Dropdown actions on index and show pages
- Show page: responsive grid cards for info, batch name in heading

### Teacher Management
- Admin CRUD, assign teachers to batches
- Detail page with assigned batches
- Dropdown actions (view/edit/delete)
- Sticky first column on index table

### Coaching Classes
- Define class names with default fees
- Dropdown actions (edit/delete)
- Pagination with page numbers

### Enrollment System
- Connect students to batches with capacity checks
- Selectable enrollment date
- History logging with action dates

### Fee Tracking
- Monthly tracking (month/year), payment recording
- Sticky first column on wide fee grid table
- Dropdown for header menu, direct delete button

### Attendance
- Bulk marking via create page (batch select + date in flex row)
- Single record edit (status + notes)
- Dropdown actions (edit/delete) on index
- Sticky first column on index table
- Completed batches filtered from dropdown

### UI/UX
- ConfirmDialog + sonner toast across all pages
- Tables: sticky first column, whitespace-nowrap on headers/cells
- EllipsisVertical (vertical three dots) for multi-action dropdowns
- Search bars: X icon to reset, RefreshCw icon with spin animation on click
- Pagination: shadcn-style with page numbers, 10 records per page
- Badge variants: success (green-600), danger (red-600)
- Button destructive variant: bg-red-600 text-white

### Other
- CSV Export — Export students and attendance data
- PWA — Service worker, manifest, offline support
- Localization — Bangla language switcher
- Responsive Landing Page — Modern design with dynamic stats, hero section min-h-screen
- Favicon — Properly configured with manifest.json
- Auth Layout — Logo on top, form in bordered container

## RBAC Roles

| Role | Access |
|------|--------|
| Admin | Full access — manage all students, teachers, batches, fees, attendance |
| Teacher | View assigned batches, mark attendance, view fees (read-only) |

## Setup

```bash
# Install dependencies
composer install
npm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env file, then run:
php artisan migrate:fresh --seed

# Generate Wayfinder routes
php artisan wayfinder:generate --with-form

# Build frontend assets
npm run build

# Start development server
php artisan serve
```

## Database Commands

```bash
php artisan migrate                    # Run all migrations
php artisan migrate:fresh --seed       # Reset and seed
php artisan migrate:rollback           # Rollback last batch
```

## Seeding Commands

```bash
php artisan db:seed                           # Seed all tables
php artisan db:seed --class=AdminSeeder       # Seed admin only
php artisan db:seed --class=TeacherSeeder     # Seed teachers only
php artisan db:seed --class=StudentSeeder     # Seed students only
```

## Make Admin Command

```bash
php artisan make:admin --create                  # Create new admin interactively
php artisan make:admin user@example.com          # Promote existing user
php artisan make:admin --create admin@example.com  # Create with specific email
```

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@academia.com | password |
| Teacher | john@academia.com | password |
| Teacher | sarah@academia.com | password |
| Teacher | michael@academia.com | password |

## Routes

| Route | Description |
|-------|-------------|
| `GET /` | Landing page (welcome) |
| `GET /dashboard` | Dashboard (admin/teacher) |
| `GET /students` | Student management |
| `GET /teachers` | Teacher management (admin) |
| `GET /batches` | Batch management |
| `GET /coaching-classes` | Coaching class management |
| `GET /fees` | Fee tracking |
| `GET /attendance` | Attendance management |
| `GET /settings/profile` | Profile settings |
| `GET /settings/security` | Security settings |

## Project Structure

```
app/
├── Http/
│   ├── Controllers/          # Backend controllers
│   ├── Middleware/            # Custom middleware (RoleMiddleware)
│   └── Requests/             # Form request validation
├── Models/                   # Eloquent models (8 models)
├── Policies/                 # Authorization policies
database/
├── migrations/               # Database migrations
├── seeders/                  # Database seeders
├── factories/                # Model factories
routes/
├── web.php                   # Main routes
├── students.php              # Student routes
├── batches.php               # Batch routes
├── teachers.php              # Teacher routes
├── fees.php                  # Fee routes
├── attendance.php            # Attendance routes
├── classes.php               # Coaching class routes
└── settings.php              # Settings routes
resources/
├── js/
│   ├── pages/                # Inertia.js pages
│   ├── components/           # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── confirm-dialog.tsx
│   │   ├── clock.tsx
│   │   ├── heading.tsx
│   │   └── pagination.tsx
│   ├── layouts/              # Layout components
│   ├── routes/               # Wayfinder typed routes
│   └── types/                # TypeScript types
public/
├── build/                    # Compiled assets
├── sw.js                     # Service worker
└── manifest.json             # PWA manifest
```

## Models

| Model | Description |
|-------|-------------|
| User | Authentication + role (admin/teacher) |
| Student | Student profiles with coaching class |
| Batch | Class batches with days/time schedule |
| CoachingClass | Class definitions with default fees |
| Enrollment | Student-batch relationships |
| FeeStatus | Monthly fee tracking records |
| Attendance | Daily attendance records |
| BatchHistory | Batch action history (enrollment/completion/removal) |

## Testing

```bash
php artisan test                    # Run all tests
php artisan test --filter=Student   # Run specific test
```

## License

MIT
