<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\FeeStatus;
use App\Models\Holiday;
use App\Models\Notice;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        // Super admin goes to platform dashboard
        if ($user->isSuperAdmin()) {
            return to_route('super-admin.dashboard');
        }

        if ($user->isAdmin()) {
            return $this->adminDashboard($request);
        }

        if ($user->isTeacher() && ! $user->is_approved) {
            return Inertia::render('dashboard', [
                'isPendingApproval' => true,
                'pendingTeacher' => [
                    'name' => $user->name,
                    'email' => $user->email,
                ],
            ]);
        }

        return $this->teacherDashboard($request);
    }

    private function adminDashboard(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;

        $stats = [
            'total_students' => Student::where('tenant_id', $tenantId)->where('status', 'active')->count(),
            'total_teachers' => User::where('tenant_id', $tenantId)->where('role', 'staff')->count(),
            'active_batches' => Batch::where('tenant_id', $tenantId)->where('status', 'active')->count(),
            'total_enrollments' => Enrollment::where('tenant_id', $tenantId)->where('status', 'active')->count(),
        ];

        $feeStats = [
            'total_collected' => FeeStatus::where('tenant_id', $tenantId)->sum('amount_paid'),
            'total_records' => FeeStatus::where('tenant_id', $tenantId)->count(),
        ];

        $recentEnrollments = Enrollment::with(['student', 'batch'])
            ->where('tenant_id', $tenantId)
            ->latest()
            ->take(5)
            ->get();

        $recentFeePayments = FeeStatus::with(['student', 'batch'])
            ->where('tenant_id', $tenantId)
            ->latest('created_at')
            ->take(5)
            ->get();

        $todayAttendance = [
            'present' => Attendance::where('tenant_id', $tenantId)->whereDate('date', now())->where('status', 'present')->count(),
            'absent' => Attendance::where('tenant_id', $tenantId)->whereDate('date', now())->where('status', 'absent')->count(),
            'late' => Attendance::where('tenant_id', $tenantId)->whereDate('date', now())->where('status', 'late')->count(),
        ];

        $recentStudents = Student::with('coachingClass')->where('tenant_id', $tenantId)->latest()->take(5)->get();

        $activeNotices = Notice::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->whereNull('batch_id')
            ->latest()
            ->take(5)
            ->get();

        $upcomingHolidays = Holiday::where('tenant_id', $tenantId)
            ->where('end_date', '>=', now())
            ->orderBy('start_date')
            ->take(5)
            ->get();

        $batchHistory = [
            'completed' => Batch::where('tenant_id', $tenantId)->where('status', 'completed')->count(),
            'active' => Batch::where('tenant_id', $tenantId)->where('status', 'active')->count(),
        ];

        $attendanceTrend = collect(range(5, 0))->map(function ($i) use ($tenantId) {
            $date = now()->subMonths($i);

            return [
                'month' => $date->format('M Y'),
                'present' => Attendance::where('tenant_id', $tenantId)->whereDate('date', $date)->where('status', 'present')->count(),
                'absent' => Attendance::where('tenant_id', $tenantId)->whereDate('date', $date)->where('status', 'absent')->count(),
                'late' => Attendance::where('tenant_id', $tenantId)->whereDate('date', $date)->where('status', 'late')->count(),
            ];
        });

        $enrollmentTrend = collect(range(5, 0))->map(function ($i) use ($tenantId) {
            $date = now()->subMonths($i);

            return [
                'month' => $date->format('M Y'),
                'enrollments' => Enrollment::where('tenant_id', $tenantId)->whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)->count(),
            ];
        });

        $feeTrend = collect(range(5, 0))->map(function ($i) use ($tenantId) {
            $date = now()->subMonths($i);

            return [
                'month' => $date->format('M Y'),
                'collected' => (float) FeeStatus::where('tenant_id', $tenantId)->whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)->sum('amount_paid'),
            ];
        });

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'feeStats' => $feeStats,
            'recentEnrollments' => $recentEnrollments,
            'recentFeePayments' => $recentFeePayments,
            'todayAttendance' => $todayAttendance,
            'recentStudents' => $recentStudents,
            'activeNotices' => $activeNotices,
            'upcomingHolidays' => $upcomingHolidays,
            'batchHistory' => $batchHistory,
            'attendanceTrend' => $attendanceTrend,
            'enrollmentTrend' => $enrollmentTrend,
            'feeTrend' => $feeTrend,
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
        if (! empty($enrolledStudentIds)) {
            $recentStudents = Student::with('coachingClass')
                ->whereIn('id', $enrolledStudentIds)
                ->latest()
                ->take(5)
                ->get();
        }

        $activeNotices = Notice::where('tenant_id', $teacher->tenant_id)
            ->where('is_active', true)
            ->where(function ($q) use ($assignedBatchIds) {
                $q->whereNull('batch_id')
                    ->orWhereIn('batch_id', $assignedBatchIds);
            })
            ->latest()
            ->take(5)
            ->get();

        $upcomingHolidays = Holiday::where('tenant_id', $teacher->tenant_id)
            ->where('end_date', '>=', now())
            ->orderBy('start_date')
            ->take(5)
            ->get();

        $batchHistory = [
            'completed' => Batch::whereIn('id', $assignedBatchIds)->where('status', 'completed')->count(),
            'active' => Batch::whereIn('id', $assignedBatchIds)->where('status', 'active')->count(),
        ];

        $attendanceTrend = collect(range(5, 0))->map(function ($i) use ($assignedBatchIds) {
            $date = now()->subMonths($i);

            return [
                'month' => $date->format('M Y'),
                'present' => Attendance::whereDate('date', $date)->where('status', 'present')
                    ->whereIn('batch_id', $assignedBatchIds)->count(),
                'absent' => Attendance::whereDate('date', $date)->where('status', 'absent')
                    ->whereIn('batch_id', $assignedBatchIds)->count(),
                'late' => Attendance::whereDate('date', $date)->where('status', 'late')
                    ->whereIn('batch_id', $assignedBatchIds)->count(),
            ];
        });

        $enrollmentTrend = collect(range(5, 0))->map(function ($i) use ($assignedBatchIds) {
            $date = now()->subMonths($i);

            return [
                'month' => $date->format('M Y'),
                'enrollments' => Enrollment::whereIn('batch_id', $assignedBatchIds)
                    ->whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)->count(),
            ];
        });

        $feeTrend = collect(range(5, 0))->map(function ($i) use ($assignedBatchIds) {
            $date = now()->subMonths($i);

            return [
                'month' => $date->format('M Y'),
                'collected' => (float) FeeStatus::whereIn('batch_id', $assignedBatchIds)
                    ->whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)->sum('amount_paid'),
            ];
        });

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'feeStats' => $feeStats,
            'recentEnrollments' => $recentEnrollments,
            'recentFeePayments' => $recentFeePayments,
            'todayAttendance' => $todayAttendance,
            'recentStudents' => $recentStudents,
            'activeNotices' => $activeNotices,
            'upcomingHolidays' => $upcomingHolidays,
            'assignedBatches' => $assignedBatches,
            'batchHistory' => $batchHistory,
            'attendanceTrend' => $attendanceTrend,
            'enrollmentTrend' => $enrollmentTrend,
            'feeTrend' => $feeTrend,
        ]);
    }
}
