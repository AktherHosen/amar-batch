# Academia - Coaching Management System

A Laravel + Inertia.js application for managing coaching centers with role-based access control (RBAC).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 13 + PHP 8.3 |
| Frontend | React 19 + TypeScript 5.7 + Inertia.js 3 |
| UI | Tailwind CSS 4 + shadcn/ui (New York variant) |
| Auth | Laravel Fortify (passkeys, 2FA, password reset) |
| Routing | Wayfinder (auto-generated typed routes) |
| DB | MySQL |
| Testing | PHPUnit 12 |
| PWA | Service Worker + Manifest |

## Features

- **Student Management** — Full CRUD with coaching class assignment, joined/left dates
- **Batch Management** — Create batches with days/time schedule, capacity tracking
- **Teacher Management** — Admin CRUD, assign teachers to batches
- **Coaching Classes** — Define class names with default fees
- **Enrollment System** — Connect students to batches with capacity checks
- **Fee Tracking** — Monthly tracking (month/year), payment recording
- **Attendance** — Daily marking, history, student reports
- **Dashboard** — Role-based stats (admin sees all, teacher sees assigned)
- **CSV Export** — Export students and attendance data
- **PWA** — Service worker, manifest, offline support
- **Localization** — Bangla language switcher
- **Responsive Landing Page** — Modern design with dynamic stats

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
├── Models/                   # Eloquent models (7 models)
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
│   ├── layouts/              # Layout components
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

## Testing

```bash
php artisan test                    # Run all tests
php artisan test --filter=Student   # Run specific test
```

## License

MIT
