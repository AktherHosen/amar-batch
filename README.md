# Academia - Coaching Management System

A Laravel + Inertia.js application for managing coaching centers with RBAC support.

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

# Build frontend assets
npm run build

# Start development server
php artisan serve
```

## Database Commands

```bash
# Run all migrations
php artisan migrate

# Run migrations with fresh seed
php artisan migrate:fresh --seed

# Rollback last migration batch
php artisan migrate:rollback

# Reset and re-run all migrations
php artisan migrate:fresh
```

## Seeding Commands

```bash
# Seed all tables (Admin, Teachers, Students)
php artisan db:seed

# Seed specific seeder
php artisan db:seed --class=AdminSeeder
php artisan db:seed --class=TeacherSeeder
php artisan db:seed --class=StudentSeeder
```

## Make Admin Command

```bash
# Create a new admin user interactively
php artisan make:admin --create

# Promote an existing user to admin
php artisan make:admin user@example.com

# Create admin with specific email interactively
php artisan make:admin --create admin@example.com
```

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@academia.com | password |
| Teacher | john@academia.com | password |
| Teacher | sarah@academia.com | password |
| Teacher | michael@academia.com | password |
| Student | alice@academia.com | password |
| Student | bob@academia.com | password |
| Student | charlie@academia.com | password |
| Student | diana@academia.com | password |
| Student | eve@academia.com | password |

## Route Generation

```bash
# Generate Wayfinder routes for frontend
php artisan wayfinder:generate --with-form

# Build frontend assets
npm run build
```

## Project Structure

- `app/Http/Controllers/` - Backend controllers
- `app/Models/` - Eloquent models
- `app/Policies/` - Authorization policies
- `app/Http/Middleware/` - Custom middleware
- `database/migrations/` - Database migrations
- `database/seeders/` - Database seeders
- `resources/js/pages/` - Inertia.js pages
- `resources/js/components/` - React components
- `routes/` - Laravel routes
