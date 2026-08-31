# Agents - Project Conventions

## Project

**Amar Batch** — Multi-tenant coaching center management SaaS built with Laravel 13 + Inertia.js 3 (React 19).

## Tech Stack

### Backend
- **Framework:** Laravel 13
- **Auth:** Laravel Fortify (registration, login, password reset, 2FA)
- **API Tokens:** Sanctum
- **Payment Gateway:** SSLCommerz (BDT currency)
- **Excel:** Maatwebsite Excel (import/export)
- **PDF:** barryvdh/laravel-dompdf (receipts)
- **Scheduling:** `subscriptions:check-expiry` runs daily

### Frontend
- **UI Framework:** React 19 + Inertia.js 3
- **Styling:** Tailwind CSS + shadcn/ui components
- **Animations:** Framer Motion
- **Charts:** Chart.js + react-chartjs-2 (NOT recharts — React 19 incompatibility)
- **i18next:** Internationalization (English + Bangla)
- **Excel:** xlsx library for client-side parsing
- **PDF:** jspdf + jspdf-autotable for client-side PDF generation
- **State:** useSyncExternalStore for theme/locale persistence

## Code Style

- Use `whitespace-nowrap` on all `TableHead` and `TableCell` components
- Sticky first column on wide tables: `sticky left-0 bg-background z-10`
- Badge variants: `success` (green-600) for completed, `danger` (red-600) for inactive/dropped
- Button `destructive` variant: `bg-red-600 text-white`

## Multi-Tenancy

- All tenant models use the `BelongsToTenant` trait (`app/Concerns/BelongsToTenant.php`)
- The trait auto-scopes queries to the current tenant and auto-fills `tenant_id` on creation
- Never hardcode `tenant_id` — always rely on the trait
- Super admin bypasses tenant scoping

## UI Patterns

### Multi-Action Dropdowns
Use `EllipsisVertical` icon in a `DropdownMenu` for tables with edit + delete:
```tsx
<DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="size-8 p-0">
            <EllipsisVertical className="size-4" />
        </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.get(editRoute(id))}>
            <PenLine className="mr-2 size-4" />
            Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 size-4" />
            Delete
        </DropdownMenuItem>
    </DropdownMenuContent>
</DropdownMenu>
```

### Single-Action Delete
For tables where only delete is needed, use a direct button:
```tsx
<Button variant="ghost" size="sm" className="size-8 p-0 text-destructive hover:text-destructive" onClick={handleDelete}>
    <Trash2 className="size-4" />
</Button>
```

### Search Bars
Always include:
- `X` icon button to reset filter (calls `router.get` with cleared params)
- `RefreshCw` icon button with `animate-spin` class while loading

### Pagination
Use the reusable `Pagination` component with:
- 10 records per page
- Page numbers with ellipsis for large page counts
- Only show when `lastPage > 1`

### Confirm Dialogs
Use `ConfirmDialog` component (not browser `confirm()`) with `sonner` toast for success messages.

### Tables
- First column: `sticky left-0 bg-background z-10 min-w-[150px]`
- All headers/cells: `whitespace-nowrap`
- Action column: `w-[50px]` or `w-[80px]`

## Animations (Framer Motion)

- Install: `npm install framer-motion`
- Reusable components: `resources/js/components/animated.tsx` (PageTransition, StaggerChildren, FadeInUp, ScaleIn, SlideIn, AnimatedCard, AnimatedTableRow)
- **Dashboard**: Stat cards stagger in, notices/holidays/quick actions fade in sequentially, chart cards animate with delays
- **Table rows**: Stagger in from left with `<motion.tbody>` wrapping rows (do NOT nest inside `<TableBody>`)
- **Form pages**: Fade-in-up transition on page load
- **Sidebar**: Staggered slide-in on nav items

### Table Animation Pattern
```tsx
// Use <motion.tbody> directly — do NOT wrap in <TableBody>
<motion.tbody
    initial="hidden"
    animate="visible"
    variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.03 } },
    }}
>
    {data.map((item) => (
        <motion.tr
            key={item.id}
            variants={{
                hidden: { opacity: 0, x: -8 },
                visible: { opacity: 1, x: 0 },
            }}
        >
            <TableCell>...</TableCell>
        </motion.tr>
    ))}
</motion.tbody>
```

## Feature Gating

- Plans have a `features` JSON array (e.g. `['attendance', 'fees', 'exams', 'reports']`)
- `Plan::hasFeature($feature)` method checks feature availability
- `tenant.features` shared via Inertia in `HandleInertiaRequests` middleware
- Frontend hooks: `useFeatures()` and `useHasFeature()` from `resources/js/lib/features.ts`
- Sidebar nav items are feature-gated (exams, reports, branches, notices, holidays)
- Dashboard quick actions are feature-gated

## Dashboard

- Stat cards: `grid grid-cols-2 lg:grid-cols-4 gap-3`
- Charts: Use `chart.js` + `react-chartjs-2` (NOT recharts - React 19 incompatibility)
- Chart types: doughnut (attendance), bar (enrollment trend), line (fee collection)
- Clock: Hidden on mobile (`hidden lg:block`), right-aligned
- Active notices widget (feature-gated)
- Upcoming holidays widget
- Quick actions: Add Student, Mark Attendance, Record Payment, Post Notice (admin only)
- Clickable student/batch links in stat cards
- **Greeting banner:** Uses accent color from appearance theme settings as background via `color-mix()`, works with all 9 preset accents + custom hex colors, proper dark/light mode handling

## Batch Detail Pages

- Heading: batch name in h1
- Info: `grid grid-cols-2 gap-3` cards
- Actions: `EllipsisVertical` dropdown
- Capacity progress bar with percentage
- Capacity warning badge when full/near-full
- Clickable student names linking to student detail

## Student Detail Pages

- Match batch detail style (icon-only back button, h1 title, `grid grid-cols-2 gap-3` cards)
- Avatar/photo display
- Attendance % summary with progress bar
- Fee summary card

## Notice Board

- `Notice` model with title, content, target_audience, priority, is_active
- CRUD pages: index (with search), create, edit, show
- Notices shown on dashboard (active notices widget)
- Feature-gated by subscription plan
- Routes: `/notices`, `/notices/create`, `/notices/{notice}`

## Holiday Calendar

- `Holiday` model with title, description, start_date, end_date, type (holiday/exam/event)
- CRUD pages: index (with year/type filters), create, edit, show
- Upcoming holidays widget on dashboard
- `checkDate` API endpoint for checking conflicts
- Routes: `/holidays`, `/holidays/create`, `/holidays/{holiday}`

## Fee Receipts

- `FeeReceipt` model tracks payment receipts with receipt_number, student_id, amount, payment_method
- `FeeReceiptController` with PDF view and CSV export
- Receipt index and detail pages
- Routes: `/fees/receipts`, `/fees/receipts/{receipt}`

## Exam Management

- `Exam` model with title, subject, exam_date, total_marks, passing_marks, class, batch
- CRUD pages: index (with search), create, edit, show
- Feature-gated by `exams` plan feature
- Routes: `/exams`, `/exams/create`, `/exams/{exam}`

## In-App Notifications

- `InAppNotification` model for real-time in-app notifications
- `NotificationBell` component in header
- Notification index page with read/unread status
- Routes: `/notifications`, `/notifications/{notification}/read`

## SMS Notifications

- **Provider:** Pluggable SMS providers (Alpha SMS, eSMS) via `SmsService` abstraction
- **Settings:** Per-tenant `sms_settings` table with provider, api_key, sender_id, is_enabled
- **Logs:** Every SMS logged in `sms_logs` with recipient, message, type, status, provider_response
- **Automation:** `notification_schedules` table with configurable rules per tenant
- **Scheduled Commands:**
  - `sms:fee-reminders` — daily at 9am, checks unpaid fees, sends SMS to student phones
  - `sms:absence-alerts` — daily at 6pm, sends SMS for students marked absent today
  - `sms:exam-reminders` — daily at 8am, sends SMS for exams in next 1-3 days
- **Manual SMS:** Admin sends SMS to selected students or custom phone numbers
- **Feature-gated:** `sms_notifications` plan feature (Basic, Pro, Enterprise plans)
- **Frontend Pages:** SMS Settings (`/dashboard/sms/settings`), Send SMS (`/dashboard/sms/send`), SMS Logs (`/dashboard/sms/logs`)
- **Providers:** `app/Services/SmsProviders/AlphaSmsProvider.php`, `EsmsProvider.php`
- **Routes:** `/dashboard/sms/settings`, `/dashboard/sms/send`, `/dashboard/sms/logs`
- **Sidebar:** Communication section → SMS group (Send SMS, SMS Logs, SMS Settings)

## Reports & Analytics

- `ReportController` with stats and trends endpoints
- Reports page with Chart.js charts
- Feature-gated by `reports` plan feature
- Routes: `/reports`

## Multi-Branch Support

- `Branch` model for multi-location coaching centers
- CRUD pages: index, create, edit, show
- Feature-gated by `multi_branch` plan feature
- Routes: `/branches`, `/branches/create`, `/branches/{branch}`

## API Access

- Sanctum-based API tokens
- `ApiTokenController` for token management
- Settings page for API token management
- Feature-gated by `api_access` plan feature
- Routes: `/settings/api-tokens`

## Backend

- All controllers use `paginate(10)` for index endpoints
- Accept `per_page` param but default to 10
- Use `withQueryString()` on paginated results
- Attendance batch filtering: `where('status', '!=', 'completed')`
- Tenant scoping is automatic via `BelongsToTenant` trait on models
- Owner = admin role for tenant. Staff = teacher role.
- Use `$this->authorize('action', Model::class)` in controllers (Policies handle tenant scoping)
- All controllers use Form Request classes for validation (21 request classes in `app/Http/Requests/`)
- Soft deletes on most models (students, batches, teachers, users, etc.)

## User Roles

| Role | Constant | Access |
|------|----------|--------|
| Super Admin | `super_admin` | Global — tenants, plans, cross-tenant stats |
| Owner | `owner` | Tenant admin — full CRUD on all tenant resources |
| Staff | `staff` | Tenant teacher — view assigned batches, mark attendance (requires approval) |
| Inactive | `inactive` | Deactivated user — no access |
| Student | `student` | Referenced in code but no dedicated controllers |
| Parent | `parent` | Referenced in code but no dedicated controllers |

## RBAC (Role-Based Access Control)

- Central permissions catalog: `config/role-routes.php` defines 15 route groups
- `Role` model with `permissions` (JSON array of route-name patterns), `slug`, `is_system`
- `User::hasRoutePermission($routeName)` — super_admin/owner get wildcard `['*']` access
- `Str::is()` glob matching for permission checks
- Middleware: `role.permission` (CheckRoutePermission) enforces route-level access
- Always-allowed routes: dashboard, notifications, profile, password, security, subscription, payment, onboarding
- System roles seeded via `app/Support/DefaultRoles.php` — Owner (wildcard) + Staff (limited)
- Frontend: `usePermissions()` and `useHasPermission()` from `resources/js/lib/permissions.ts`
- Role helpers: `isOwner()`, `isStaff()`, `isSuperAdmin()` from `resources/js/lib/role.ts`

## Middleware Stack

Tenant routes use this middleware chain: `auth → verified → onboarding → tenant → role.permission → teacher.approved`

- **OnboardingMiddleware:** Redirects owners with `onboarding_complete=false` to setup wizard. Also redirects expired subscriptions to payment page.
- **TenantMiddleware:** Sets `app('branch_id')` for branch-scoped users. Bypassed for super_admin.
- **CheckRoutePermission:** Enforces RBAC for non-admin users. Resolves user's Role by slug, checks route permission.
- **CheckTeacherApproval:** Blocks unapproved teachers with warning toast redirect.

## Branch-Scoped Data Access

- `BelongsToBranch` trait (`app/Concerns/BelongsToBranch.php`) — auto-fills `branch_id`, adds global scope
- `scopeForBranch($query, $branchId)` — manual scoping helper
- Used by: `Student`, `Batch`, `Enrollment`, `FeeStatus`, `ExamResult`
- Models without direct `branch_id` override `branchScopeQuery()` (e.g., Enrollment scopes via batch)
- `TenantMiddleware` sets `app('branch_id')` when `$user->isBranchScoped()` is true

## Plan Limits

- `PlanLimitsPolicy` (`app/Policies/PlanLimitsPolicy.php`) — utility class, not a standard policy
- 3 limit types: `students` (max_students), `staff` (max_staff), `batches` (max_batches)
- `-1` = unlimited. Otherwise compares current count < max.
- Current counts: active students, staff/teacher role users, all batches
- Enforcement in controllers: `createStudent()`, `createStaff()`, `createBatch()`
- Exceeded limit redirects to `subscription.index` with warning toast

## Plan Features

- `PlanFeature` model with `name`, `slug`, `is_system` flag
- System features cannot be renamed or deleted (seeded via `PlanSeeder`)
- `Plan::hasFeature($feature)` checks feature availability
- Super admin CRUD: `PlanFeatureController` with JSON responses
- Frontend: `useFeatures()` and `useHasFeature()` from `resources/js/lib/features.ts`
- `PlanCard` component shows check/minus comparison for ALL features on both landing and subscription pages

## Subscription & Payment

- **Gateway:** SSLCommerz (sandbox: `sandbox.sslcommerz.com`, prod: `securepay.sslcommerz.com`)
- **Currency:** BDT (Bangladeshi Taka)
- **Subscription model:** `tenant_id`, `plan_id`, `status` (active/trial), `billing_type`, `trial_ends_at`, `ends_at`
- **Payment model:** `tenant_id`, `subscription_id`, `txid`, `amount`, `status` (pending/success/failed/cancelled), `gateway_response` (JSON)
- **Plan model:** `name`, `slug`, `price_monthly`, `price_yearly`, `max_students`, `max_staff`, `max_batches`, `features` (JSON)
- **Flow:** Upgrade → initiate payment → redirect to gateway → callbacks (success/failure/cancel/ipn) → `markPaidAndActivate()` in DB transaction with `lockForUpdate()`
- **Scheduled:** `subscriptions:check-expiry` runs daily
- **Controller:** `SubscriptionController` (upgrade), `PaymentController` (initiate + callbacks)
- **Service:** `SslcommerzService` handles gateway API calls
- **Payment Settings:** `PaymentSetting` model stores gateway config in DB; `SslcommerzService` reads DB first, falls back to env
- **Manual payments:** Create `Payment` records with `payment_method='manual'` and status `pending`; super admin approves/rejects via Payments page

## Super Admin Panel

- Prefix: `super-admin/`, middleware: `['auth', 'verified', 'role:super_admin']`
- **Dashboard:** Global stats (tenants, users, students, batches, revenue), revenue by plan chart, recent tenants/payments/contacts
- **Tenants:** List with search/status, detail with stats, toggle active/inactive
- **Plans:** Full CRUD. Validates prices, limits (-1 = unlimited), features array
- **Payments:** List with status/search, approve/cancel pending payments
- **Contacts:** List with search/unread, reply via email (Mailable), mark as read
- **Owners:** List with tenant/plan info, detail page with owner info + subscription + plan history
- **Payment Settings:** Gateway config (SSLCommerz credentials, manual payment toggle, instructions)
- **Plan Features:** Dynamic CRUD for plan features (name, slug, is_system flag)
- **Controllers:** `SuperAdminController`, `TenantController`, `PlanController`, `ContactMessageController`, `OwnerController`, `PaymentSettingController`, `PlanFeatureController`

## Onboarding Flow

1. User registers → `onboarding_complete = false`
2. `OnboardingMiddleware` redirects to `GET onboarding`
3. User submits coaching name/email/phone
4. System creates `Tenant` with auto-generated slug
5. Assigns **default plan** as 14-day trial subscription
6. Links user to tenant, sets `onboarding_complete = true`
7. Seeds default roles via `DefaultRoles::createForTenant()`
8. Redirects to dashboard with success toast

## Owner Plan History

- `SubscriptionHistory` model tracks all plan changes per tenant
- Actions: `trial_started`, `activated`, `upgraded`, `downgraded`, `renewed`
- Records: `tenant_id`, `subscription_id`, `plan_id`, `action`, `status`, `old_plan_name`, `new_plan_name`, `amount`, `billing_type`
- Created in: `OnboardingController` (trial_started), `OwnerController::assignPlan` (activated/upgraded/downgraded), `PaymentController::activateSubscription` (activated/renewed/upgraded/downgraded)
- Displayed on super admin owner detail page as a timeline with colored action icons
- Existing subscriptions backfilled via `SubscriptionHistorySeeder`

## Enrollment Management

- `Enrollment` model: `student_id`, `batch_id`, `enrolled_at`, `status`, `paused_at`, `resumed_at`
- Statuses: `active`, `completed`, `dropped`, `paused`
- Traits: `BelongsToBranch` (scoped via batch), `BelongsToTenant`
- Creates `BatchHistory` record on enroll/update/remove
- Routes nested under batches: `POST batches/{batch}/enroll`, `PUT/DELETE enrollments/{enrollment}`
- Duplicate enrollment validation, enrollment date >= batch start date check
- **Pause/Resume workflow:**
  - Pausing sets `paused_at`, clears `resumed_at`, records `BatchHistory`
  - Resuming sets `resumed_at`, records `BatchHistory`
  - Paused students are excluded from: attendance sheets, fee grid, batch capacity count
  - `Batch::enrolledCount()` only counts `status = 'active'`
  - Dropdown actions: Pause (for active), Resume (for paused), Complete, Drop, Unenroll

## Fee Status Management

- `FeeStatus` model: `student_id`, `batch_id`, `month` (1-12), `year`, `amount_paid`, `notes`
- Grid view: all students × months for a given year
- `updateOrCreate()` upserts by student+batch+month+year
- `destroyStudentBatch()` deletes ALL fee records for a student+batch combination
- Auto-creates `InAppNotification` on fee recording
- Admin-only controller (checks `isAdmin()`)
- Routes: `/fees`, `/fees/create`, `/fees/{feeStatus}`

## Exam Results

- `ExamResult` model: `exam_id`, `student_id`, `marks_obtained`, `notes`
- Branch scoping via: `exam → batch → branch_id`
- `ExamController::storeResults` — `POST exams/{exam}/results`
- Validates `marks_obtained <= exam.total_marks`
- `updateOrCreate()` upserts results
- Exam show page loads results + enrolled students for entry form

## Coaching Class Management

- `CoachingClass` model: `name`, `default_fee`
- Relationships: `hasMany(Student::class)`
- CRUD + import from Excel (`name`, `default_fee` rows)
- Plan-limited creation via `PlanLimitsPolicy`
- Routes: `resource('coaching-classes', ...)`, `POST coaching-classes/import`

## Teacher/Staff Approval Workflow

1. Admin creates teacher → default `role='teacher'`, plan limits checked
2. `updateStatus` endpoint sets `is_approved = false` for pending state
3. `CheckTeacherApproval` middleware blocks unapproved teachers
4. Admin approves: `POST teachers/{teacher}/approve` → `is_approved = true`
5. Admin rejects: `POST teachers/{teacher}/reject` → `is_approved = false`
6. Deactivation: toggles `role='inactive'`, detaches assigned batches
7. All actions require specific `teachers.*` route permissions
- Import: `POST teachers/import` accepts `name`, `email`, `password`, `role`, `branch_id`

## User Management

- Full CRUD with plan-limited creation
- Filters: `status` (active/inactive), `role`, `search`
- Owner users cannot be edited, role-changed, deactivated, or deleted
- `changeRole` endpoint: `POST users/{user}/role`
- Deactivation/reactivation with batch detachment
- Approval workflow: `approve`, `reject` endpoints
- Avatar upload handling on create/update
- Routes: `resource('users', ...)`, plus `/users/{user}/role`, `/users/{user}/deactivate`, etc.

## Bulk Import/Export

**Import supported for:** Students, Teachers, Batches, Coaching Classes, Branches, Attendance, Fees, Exams, Notices, Holidays

**Pattern:** Frontend parses Excel → sends rows to Laravel → backend loops with try/catch → reports imported/skipped count

**Export:** Students only — CSV with ID, Name, Phone, Class, Section, Status, Guardian info, Joined At

**Frontend utilities:**
- `resources/js/lib/excel.ts` — `exportToExcel()`, `importFromExcel()` (xlsx library)
- `resources/js/lib/pdf-table.ts` — `generateTablePDF()` (jspdf + jspdf-autotable) with branded header, page numbers

## Public Pages

| Route | Page |
|-------|------|
| `GET /` | Landing page with global stats + active plans |
| `GET /up` | Health check (`{"status": "ok"}`) |
| `GET /docs` | Documentation |
| `GET /contact` | Contact form |
| `POST /contact` | Store ContactMessage + email notification |
| `GET /terms` | Terms of Service |
| `GET /privacy` | Privacy Policy |

**Payment callbacks (CSRF-exempt):** `/payment/success`, `/payment/failure`, `/payment/cancel`, `/payment/ipn`

## Internationalization (i18n)

- **Languages:** English (`en`) + Bangla (`bn`)
- **Library:** i18next + react-i18next
- **Config:** `resources/js/i18n/index.ts` — initializes with `initReactI18next`, stores locale in `localStorage`
- **Translations:** `resources/js/i18n/translations.ts` — hundreds of keys organized by domain (`app.*`, `nav.*`, `dashboard.*`, `students.*`, etc.)
- **Context:** `resources/js/contexts/locale-context.tsx` — provides `t()`, `formatDate()`, `formatTime()`, `formatCurrency()`, `formatNumber()` via `useLocale()` hook
- **Formatting:** `formatCurrency()` uses `৳` symbol for Bangla. `formatBanglaNumber()` converts digits.
- **No PHP-side translations** — all i18n is frontend/client-side only

## Custom Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useAppearance()` | `hooks/use-appearance.tsx` | Theme system: light/dark/system, 9 accent colors, corner radius, date/time format, sidebar style. Persists to localStorage + cookies. |
| `useClipboard()` | `hooks/use-clipboard.ts` | Copy to clipboard via `navigator.clipboard.writeText()` |
| `useCurrentUrl()` | `hooks/use-current-url.ts` | Active-link highlighting via Inertia page URL comparison |
| `useFlashToast()` | `hooks/use-flash-toast.ts` | Listens to Inertia `flash` events → sonner toasts |
| `useInitials()` | `hooks/use-initials.tsx` | Extracts initials from full name |
| `useIsMobile()` | `hooks/use-mobile.tsx` | Boolean based on `matchMedia(max-width: 767px)` |
| `useMobileNavigation()` | `hooks/use-mobile-navigation.ts` | Cleanup function for mobile nav pointer-events |
| `useTwoFactorAuth()` | `hooks/use-two-factor-auth.ts` | 2FA setup flow: QR code, manual key, recovery codes |

## Frontend Utilities

| File | Exports | Purpose |
|------|---------|---------|
| `lib/utils.ts` | `cn()`, `toUrl()` | Tailwind class merging (clsx + twMerge), URL extraction from Inertia props |
| `lib/features.ts` | `useFeatures()`, `useHasFeature()` | Reads `tenant.features` from Inertia props, checks feature membership |
| `lib/permissions.ts` | `usePermissions()`, `useHasPermission()` | Reads `auth.user.permissions`, glob matching for route access |
| `lib/role.ts` | `isOwner()`, `isStaff()`, `isSuperAdmin()` | Simple role-check helpers |
| `lib/excel.ts` | `exportToExcel()`, `importFromExcel()` | xlsx library — export with auto-fit, import returning headers + rows |
| `lib/pdf-table.ts` | `generateTablePDF()` | jspdf + jspdf-autotable — branded PDF with header, alternating rows, page numbers |

## Policies

| Policy | Key Rules |
|--------|-----------|
| `AttendancePolicy` | Admin always; teacher only if assigned to batch |
| `BatchPolicy` | Route permission based. Teacher if assigned; student if enrolled |
| `BranchPolicy` | Pure route permission checks (`branches.*`) |
| `CoachingClassPolicy` | Pure route permission checks (`coaching-classes.*`) |
| `EnrollmentPolicy` | Admin always; teacher if assigned to batch. Create: admin only |
| `ExamPolicy` | Route permission. Teacher if assigned to exam's batch |
| `FeeReceiptPolicy` | Admin only |
| `HolidayPolicy` | View: admin or teacher. Create/update/delete: admin only |
| `NoticePolicy` | View: admin or teacher. Create/update/delete: admin only |
| `RolePolicy` | Admin only. Cannot edit/delete system roles or roles with users |
| `StudentPolicy` | Route permission. Teacher if student in assigned batches; student can view self |
| `TeacherPolicy` | Route permission. Users can always view themselves |

## Seeders

| Seeder | Creates |
|--------|---------|
| `PlanSeeder` | 4 plans: Free Trial (default), Basic, Pro, Enterprise with BDT pricing |
| `SuperAdminSeeder` | `superadmin@amarbatch.com` / `password` |
| `AdminSeeder` | "Bright Minds Academy" tenant + owner `admin@amarbatch.com` / `password` + default roles |
| `TeacherSeeder` | 2 teachers for Bright Minds Academy |
| `CoachingClassSeeder` | 8 classes (Pre School through Class 5, fees ৳300-৳700) |
| `StudentSeeder` | 12 students with class assignments |

**Seed order:** Plans → Super Admin → Admin → Teachers → Coaching Classes → Students

## Route Generation

After adding new routes, regenerate Wayfinder typed routes:
```bash
php artisan wayfinder:generate
```

## Common Imports

```tsx
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { EllipsisVertical, PenLine, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useHasFeature } from '@/lib/features';
```
