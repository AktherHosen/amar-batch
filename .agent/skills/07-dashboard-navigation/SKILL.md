---
name: phase-8-dashboard-navigation
description: Phase 8 — Build role-based dashboard + sidebar: admin sees all stats, teacher sees assigned, student sees own. Run after Phase 7.
---

# Phase 8: Dashboard & Navigation

## Goal

Build role-aware dashboard with contextual stats and dynamic sidebar navigation.

## Prerequisites

- Phases 2-7 complete (Student, Batch, Teacher, Enrollment, Fee, Attendance)

## Step 8.1: Dashboard Stats (Role-Based)

Update `routes/web.php` dashboard route:

```php
use App\Models\Student;
use App\Models\Batch;
use App\Models\FeeStatus;
use App\Models\Enrollment;

Route::get('dashboard', function () {
    $user = auth()->user();
    $stats = [];

    if ($user->isAdmin()) {
        $stats = [
            'totalStudents' => Student::where('status', 'active')->count(),
            'totalTeachers' => \App\Models\User::where('role', 'teacher')->count(),
            'totalBatches' => Batch::where('status', 'active')->count(),
            'totalFeeCollected' => FeeStatus::where('status', 'paid')->sum('amount_paid'),
            'totalPendingFees' => FeeStatus::where('status', '!=', 'paid')->sum('amount_due'),
            'recentEnrollments' => Enrollment::with(['student', 'batch'])->latest()->take(5)->get(),
            'upcomingDues' => FeeStatus::where('status', '!=', 'paid')
                ->where('due_date', '<=', now()->addDays(7))
                ->with(['student', 'batch'])->take(5)->get(),
        ];
    } elseif ($user->isTeacher()) {
        $batchIds = $user->assignedBatches()->pluck('batches.id');
        $stats = [
            'totalStudents' => Student::whereHas('enrollments', fn($q) => $q->whereIn('batch_id', $batchIds)->where('status', 'active'))->count(),
            'totalBatches' => Batch::whereIn('id', $batchIds)->where('status', 'active')->count(),
            'recentEnrollments' => Enrollment::whereIn('batch_id', $batchIds)->with(['student', 'batch'])->latest()->take(5)->get(),
        ];
    } else {
        // Student
        $stats = [
            'enrolledBatches' => Enrollment::where('student_id', $user->student_id)
                ->with('batch')->get(),
            'pendingFees' => FeeStatus::where('student_id', $user->student_id)
                ->where('status', '!=', 'paid')->with('batch')->get(),
            'attendanceSummary' => \App\Models\Attendance::where('student_id', $user->student_id)
                ->selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
        ];
    }

    return Inertia::render('dashboard', $stats);
})->name('dashboard');
```

## Step 8.2: Dashboard Page

Replace `resources/js/pages/dashboard.tsx` with role-aware content:

```tsx
import { usePage } from '@inertiajs/react';
import { Users, BookOpen, IndianRupee, CalendarCheck, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';

type PageProps = { auth: { user: { role: string } } };

export default function Dashboard(props: any) {
    const { auth } = usePage<PageProps>().props;
    const role = auth.user.role;

    return (
        <>
            <Head title="Dashboard" />
            <div className="space-y-6">
                <Heading variant="small" title="Dashboard" description={`Welcome, ${auth.user.name}`} />

                {role === 'admin' && <AdminDashboard {...props} />}
                {role === 'teacher' && <TeacherDashboard {...props} />}
                {role === 'student' && <StudentDashboard {...props} />}
            </div>
        </>
    );
}

function AdminDashboard({ totalStudents, totalTeachers, totalBatches, totalFeeCollected, totalPendingFees, recentEnrollments, upcomingDues }) {
    return (
        <>
            {/* 4 stat cards: Students, Teachers, Batches, Fees */}
            {/* Recent Enrollments table */}
            {/* Upcoming Dues table */}
        </>
    );
}

function TeacherDashboard({ totalStudents, totalBatches, recentEnrollments }) {
    return (
        <>
            {/* 2 stat cards: My Students, My Batches */}
            {/* Recent Enrollments in my batches */}
            {/* Quick action: Mark Attendance */}
        </>
    );
}

function StudentDashboard({ enrolledBatches, pendingFees, attendanceSummary }) {
    return (
        <>
            {/* My Enrolled Batches cards */}
            {/* Fee Status summary */}
            {/* Attendance summary (present/absent/late counts) */}
            {/* Quick action: View My Attendance */}
        </>
    );
}
```

## Step 8.3: Sidebar Navigation (Role-Based)

Update `resources/js/components/app-sidebar.tsx`:

```tsx
import { usePage } from '@inertiajs/react';
import { BookOpen, CalendarCheck, IndianRupee, LayoutGrid, Users, GraduationCap } from 'lucide-react';
import { batches, dashboard, fees, students, attendance } from '@/routes';
import type { NavItem } from '@/types';

type PageProps = { auth: { user: { role: string } } };

export function AppSidebar() {
    const { auth } = usePage<PageProps>().props;
    const role = auth.user.role;

    const mainNavItems: NavItem[] = [
        { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    ];

    if (role === 'admin') {
        mainNavItems.push(
            { title: 'Students', href: students.index(), icon: Users },
            { title: 'Teachers', href: '/teachers', icon: GraduationCap },
            { title: 'Batches', href: batches.index(), icon: BookOpen },
            { title: 'Fees', href: fees.index(), icon: IndianRupee },
            { title: 'Attendance', href: '#', icon: CalendarCheck },
        );
    } else if (role === 'teacher') {
        mainNavItems.push(
            { title: 'My Batches', href: batches.index(), icon: BookOpen },
            { title: 'Students', href: students.index(), icon: Users },
            { title: 'Attendance', href: '#', icon: CalendarCheck },
        );
    } else {
        mainNavItems.push(
            { title: 'My Batches', href: batches.index(), icon: BookOpen },
            { title: 'My Attendance', href: '#', icon: CalendarCheck },
            { title: 'My Fees', href: fees.index(), icon: IndianRupee },
        );
    }

    return (
        // ... sidebar JSX with dynamic mainNavItems
    );
}
```

## After Completion

Run:
```bash
php artisan wayfinder:generate --with-form
npm run build
```

Then say: **"Load the phase-9-polish-production skill"**
