---
name: phase-8-dashboard-navigation
description: Phase 8 — Build role-based dashboard + sidebar: admin sees all stats, teacher sees assigned. No student dashboard. Run after Phase 7.
---

# Phase 8: Dashboard & Navigation

## Goal

Build role-aware dashboard with contextual stats and dynamic sidebar navigation.

## Prerequisites

- Phases 2-7 complete (Student, Batch, Teacher, Enrollment, Fee, Attendance)

## Step 8.1: Dashboard Controller (Role-Based)

Create `app/Http/Controllers/DashboardController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\FeeStatus;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return $this->adminDashboard($request);
        }

        return $this->teacherDashboard($request);
    }

    private function adminDashboard(Request $request): Response
    {
        $stats = [
            'total_students' => Student::where('status', 'active')->count(),
            'total_teachers' => User::where('role', 'teacher')->count(),
            'active_batches' => Batch::where('status', 'active')->count(),
            'total_enrollments' => Enrollment::where('status', 'active')->count(),
        ];

        $feeStats = [
            'total_collected' => FeeStatus::sum('amount_paid'),
            'total_records' => FeeStatus::count(),
        ];

        $recentEnrollments = Enrollment::with(['student', 'batch'])
            ->latest()
            ->take(5)
            ->get();

        $recentFeePayments = FeeStatus::with(['student', 'batch'])
            ->latest('created_at')
            ->take(5)
            ->get();

        $todayAttendance = [
            'present' => Attendance::whereDate('date', now())->where('status', 'present')->count(),
            'absent' => Attendance::whereDate('date', now())->where('status', 'absent')->count(),
            'late' => Attendance::whereDate('date', now())->where('status', 'late')->count(),
        ];

        $recentStudents = Student::with('coachingClass')->latest()->take(5)->get();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'feeStats' => $feeStats,
            'recentEnrollments' => $recentEnrollments,
            'recentFeePayments' => $recentFeePayments,
            'todayAttendance' => $todayAttendance,
            'recentStudents' => $recentStudents,
        ]);
    }

    private function teacherDashboard(Request $request): Response
    {
        $teacher = $request->user();
        $assignedBatchIds = $teacher->assignedBatches()->pluck('batches.id');

        $assignedBatches = Batch::withCount(['enrollments' => function ($q) {
            $q->where('status', 'active');
        }])->whereIn('id', $assignedBatchIds)->get();

        $enrolledStudentIds = Enrollment::where('status', 'active')
            ->whereIn('batch_id', $assignedBatchIds)
            ->pluck('student_id')
            ->unique()
            ->toArray();

        $studentCount = count($enrolledStudentIds);

        $stats = [
            'total_students' => $studentCount,
            'total_teachers' => null,
            'active_batches' => $assignedBatchIds->count(),
            'total_enrollments' => Enrollment::where('status', 'active')
                ->whereIn('batch_id', $assignedBatchIds)
                ->count(),
        ];

        $feeStats = [
            'total_collected' => $assignedBatchIds->isEmpty() ? 0 : FeeStatus::whereIn('batch_id', $assignedBatchIds)->sum('amount_paid'),
            'total_records' => $assignedBatchIds->isEmpty() ? 0 : FeeStatus::whereIn('batch_id', $assignedBatchIds)->count(),
        ];

        $recentEnrollments = Enrollment::with(['student', 'batch'])
            ->whereIn('batch_id', $assignedBatchIds)
            ->latest()
            ->take(5)
            ->get();

        $recentFeePayments = FeeStatus::with(['student', 'batch'])
            ->whereIn('batch_id', $assignedBatchIds)
            ->latest('created_at')
            ->take(5)
            ->get();

        $todayAttendance = [
            'present' => $assignedBatchIds->isEmpty() ? 0 : Attendance::whereDate('date', now())->where('status', 'present')
                ->whereIn('batch_id', $assignedBatchIds)->count(),
            'absent' => $assignedBatchIds->isEmpty() ? 0 : Attendance::whereDate('date', now())->where('status', 'absent')
                ->whereIn('batch_id', $assignedBatchIds)->count(),
            'late' => $assignedBatchIds->isEmpty() ? 0 : Attendance::whereDate('date', now())->where('status', 'late')
                ->whereIn('batch_id', $assignedBatchIds)->count(),
        ];

        $recentStudents = collect();
        if (!empty($enrolledStudentIds)) {
            $recentStudents = Student::with('coachingClass')
                ->whereIn('id', $enrolledStudentIds)
                ->latest()
                ->take(5)
                ->get();
        }

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'feeStats' => $feeStats,
            'recentEnrollments' => $recentEnrollments,
            'recentFeePayments' => $recentFeePayments,
            'todayAttendance' => $todayAttendance,
            'recentStudents' => $recentStudents,
            'assignedBatches' => $assignedBatches,
        ]);
    }
}
```

## Step 8.2: Dashboard Page

Replace `resources/js/pages/dashboard.tsx` with role-aware content:

```tsx
import { usePage } from '@inertiajs/react';
import { Users, BookOpen, IndianRupee, CalendarCheck, GraduationCap } from 'lucide-react';
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
            </div>
        </>
    );
}

function AdminDashboard({ stats, feeStats, recentEnrollments, recentFeePayments, todayAttendance, recentStudents }) {
    return (
        <>
            {/* 4 stat cards: Students, Teachers, Batches, Enrollments */}
            {/* Today's Attendance summary */}
            {/* Fee Collection summary */}
            {/* Recent Students table */}
            {/* Recent Enrollments table */}
            {/* Recent Fee Payments table */}
        </>
    );
}

function TeacherDashboard({ stats, feeStats, recentEnrollments, recentFeePayments, todayAttendance, recentStudents, assignedBatches }) {
    return (
        <>
            {/* 3 stat cards: My Students, My Batches, My Enrollments */}
            {/* Today's Attendance summary */}
            {/* My Batches list with student counts */}
            {/* Recent Students in my batches */}
            {/* Recent Enrollments in my batches */}
        </>
    );
}
```

## Step 8.3: Sidebar Navigation (Role-Based)

Update `resources/js/components/app-sidebar.tsx`:

```tsx
import { usePage } from '@inertiajs/react';
import { BookOpen, CalendarCheck, IndianRupee, LayoutGrid, Users, GraduationCap, School } from 'lucide-react';
import { batches, dashboard, fees, students, attendance, teachers, coachingClasses } from '@/routes';
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
            { title: 'Teachers', href: teachers.index(), icon: GraduationCap },
            { title: 'Batches', href: batches.index(), icon: BookOpen },
            { title: 'Coaching Classes', href: coachingClasses.index(), icon: School },
            { title: 'Fees', href: fees.index(), icon: IndianRupee },
            { title: 'Attendance', href: '#', icon: CalendarCheck },
        );
    } else if (role === 'teacher') {
        mainNavItems.push(
            { title: 'My Batches', href: batches.index(), icon: BookOpen },
            { title: 'Students', href: students.index(), icon: Users },
            { title: 'Attendance', href: '#', icon: CalendarCheck },
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

Then say: **"Load the phase-10-polish-production skill"**
