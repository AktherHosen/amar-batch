# Agents - Project Conventions

## Project

**Amar Batch** — Multi-tenant coaching center management SaaS built with Laravel 13 + Inertia.js 3 (React 19).

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

## User Roles

| Role | Constant | Access |
|------|----------|--------|
| Super Admin | `super_admin` | Global — tenants, plans, cross-tenant stats |
| Owner | `owner` | Tenant admin — full CRUD on all tenant resources |
| Staff | `staff` | Tenant teacher — view assigned batches, mark attendance (requires approval) |

## Middleware Stack

Tenant routes use this middleware chain: `auth → verified → onboarding → tenant → teacher.approved`

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
