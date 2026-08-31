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

        if ($user->isSuperAdmin()) {
            return to_route('super-admin.dashboard');
        }

        if ($user->isAdmin()) {
            return $this->adminDashboard($request);
        }

        if (! $user->isTeacher()) {
            return $this->adminDashboard($request);
        }

        if (! $user->is_approved) {
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

    private function getPlanFeatures(Request $request): array
    {
        return $request->user()->current_tenant?->subscription?->plan?->features ?? [];
    }

    private function computeTrend(float $current, float $previous): array
    {
        if ($previous == 0) {
            return $current > 0 ? ['percent' => 100, 'direction' => 'up'] : ['percent' => 0, 'direction' => 'neutral'];
        }

        $change = (($current - $previous) / $previous) * 100;

        if ($change > 0) {
            return ['percent' => round($change), 'direction' => 'up'];
        } elseif ($change < 0) {
            return ['percent' => round(abs($change)), 'direction' => 'down'];
        }

        return ['percent' => 0, 'direction' => 'neutral'];
    }

    private function adminDashboard(Request $request): Response
    {
        $tenantId = app('tenant_id');
        $features = $this->getPlanFeatures($request);

        $stats = [
            'total_students' => Student::where('tenant_id', $tenantId)->where('status', 'active')->count(),
            'total_teachers' => User::whereHas('tenants', fn ($q) => $q->where('tenants.id', $tenantId))->where('users.role', 'teacher')->count(),
            'active_batches' => Batch::where('tenant_id', $tenantId)->where('status', 'active')->count(),
            'total_enrollments' => Enrollment::where('tenant_id', $tenantId)->where('status', 'active')->count(),
        ];

        $lastMonthStats = [
            'total_students' => Student::where('tenant_id', $tenantId)->where('status', 'active')
                ->whereMonth('created_at', now()->subMonth()->month)
                ->whereYear('created_at', now()->subMonth()->year)
                ->count(),
            'total_teachers' => User::whereHas('tenants', fn ($q) => $q->where('tenants.id', $tenantId))->where('role', 'teacher')
                ->whereMonth('created_at', now()->subMonth()->month)
                ->whereYear('created_at', now()->subMonth()->year)
                ->count(),
            'active_batches' => Batch::where('tenant_id', $tenantId)->where('status', 'active')
                ->whereMonth('created_at', now()->subMonth()->month)
                ->whereYear('created_at', now()->subMonth()->year)
                ->count(),
            'total_enrollments' => Enrollment::where('tenant_id', $tenantId)->where('status', 'active')
                ->whereMonth('created_at', now()->subMonth()->month)
                ->whereYear('created_at', now()->subMonth()->year)
                ->count(),
        ];

        $statsTrend = [
            'total_students' => $this->computeTrend($stats['total_students'], $lastMonthStats['total_students']),
            'total_teachers' => $this->computeTrend($stats['total_teachers'], $lastMonthStats['total_teachers']),
            'active_batches' => $this->computeTrend($stats['active_batches'], $lastMonthStats['active_batches']),
            'total_enrollments' => $this->computeTrend($stats['total_enrollments'], $lastMonthStats['total_enrollments']),
        ];

        $feeStats = [
            'total_collected' => FeeStatus::where('tenant_id', $tenantId)->sum('amount_paid'),
            'total_records' => FeeStatus::where('tenant_id', $tenantId)->count(),
        ];

        $monthlyRevenue = [
            'current' => (float) FeeStatus::where('tenant_id', $tenantId)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('amount_paid'),
            'previous' => (float) FeeStatus::where('tenant_id', $tenantId)
                ->whereMonth('created_at', now()->subMonth()->month)
                ->whereYear('created_at', now()->subMonth()->year)
                ->sum('amount_paid'),
        ];
        $monthlyRevenue['trend'] = $this->computeTrend($monthlyRevenue['current'], $monthlyRevenue['previous']);

        $pendingApprovals = User::whereHas('tenants', fn ($q) => $q->where('tenants.id', $tenantId))
            ->where('role', 'teacher')
            ->where('is_approved', false)
            ->count();

        $lowCapacityBatches = Batch::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->where('capacity', '>', 0)
            ->withCount(['enrollments' => function ($q) {
                $q->where('status', 'active');
            }])
            ->get()
            ->filter(fn ($batch) => $batch->capacity > 0 && ($batch->enrollments_count / $batch->capacity) >= 0.8)
            ->map(fn ($batch) => [
                'id' => $batch->id,
                'name' => $batch->name,
                'capacity' => $batch->capacity,
                'enrollments_count' => $batch->enrollments_count,
                'percentage' => round(($batch->enrollments_count / $batch->capacity) * 100),
            ])
            ->values()
            ->all();

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
                'present' => Attendance::where('tenant_id', $tenantId)->whereMonth('date', $date->month)
                    ->whereYear('date', $date->year)->where('status', 'present')->count(),
                'absent' => Attendance::where('tenant_id', $tenantId)->whereMonth('date', $date->month)
                    ->whereYear('date', $date->year)->where('status', 'absent')->count(),
                'late' => Attendance::where('tenant_id', $tenantId)->whereMonth('date', $date->month)
                    ->whereYear('date', $date->year)->where('status', 'late')->count(),
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

        $recentActivity = collect();

        foreach ($recentStudents as $student) {
            $recentActivity->push([
                'type' => 'student',
                'title' => $student->name,
                'subtitle' => $student->coachingClass?->name ?? '',
                'date' => $student->created_at,
                'url' => "/students/{$student->id}",
            ]);
        }

        foreach ($recentEnrollments as $enrollment) {
            $recentActivity->push([
                'type' => 'enrollment',
                'title' => $enrollment->student?->name ?? 'Unknown',
                'subtitle' => $enrollment->batch?->name ?? '',
                'date' => $enrollment->created_at,
                'url' => "/batches/{$enrollment->batch_id}",
            ]);
        }

        foreach ($recentFeePayments as $payment) {
            $recentActivity->push([
                'type' => 'fee',
                'title' => $payment->student?->name ?? 'Unknown',
                'subtitle' => number_format($payment->amount_paid, 0),
                'date' => $payment->created_at,
                'url' => '/fees',
            ]);
        }

        $recentActivity = $recentActivity->sortByDesc('date')->take(5)->values()->all();

        return Inertia::render('dashboard', [
            'planFeatures' => $features,
            'stats' => $stats,
            'statsTrend' => $statsTrend,
            'feeStats' => $feeStats,
            'monthlyRevenue' => $monthlyRevenue,
            'pendingApprovals' => $pendingApprovals,
            'lowCapacityBatches' => $lowCapacityBatches,
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
            'recentActivity' => $recentActivity,
        ]);
    }

    private function teacherDashboard(Request $request): Response
    {
        $teacher = $request->user();
        $assignedBatchIds = $teacher->assignedBatches()->pluck('batches.id');
        $features = $this->getPlanFeatures($request);

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

        $statsTrend = [
            'total_students' => ['percent' => 0, 'direction' => 'neutral'],
            'total_teachers' => null,
            'active_batches' => ['percent' => 0, 'direction' => 'neutral'],
            'total_enrollments' => ['percent' => 0, 'direction' => 'neutral'],
        ];

        $feeStats = [
            'total_collected' => $assignedBatchIds->isEmpty() ? 0 : FeeStatus::whereIn('batch_id', $assignedBatchIds)->sum('amount_paid'),
            'total_records' => $assignedBatchIds->isEmpty() ? 0 : FeeStatus::whereIn('batch_id', $assignedBatchIds)->count(),
        ];

        $monthlyRevenue = [
            'current' => $assignedBatchIds->isEmpty() ? 0 : (float) FeeStatus::whereIn('batch_id', $assignedBatchIds)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('amount_paid'),
            'previous' => $assignedBatchIds->isEmpty() ? 0 : (float) FeeStatus::whereIn('batch_id', $assignedBatchIds)
                ->whereMonth('created_at', now()->subMonth()->month)
                ->whereYear('created_at', now()->subMonth()->year)
                ->sum('amount_paid'),
        ];
        $monthlyRevenue['trend'] = $this->computeTrend($monthlyRevenue['current'], $monthlyRevenue['previous']);

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

        $activeNotices = Notice::where('tenant_id', app('tenant_id'))
            ->where('is_active', true)
            ->where(function ($q) use ($assignedBatchIds) {
                $q->whereNull('batch_id')
                    ->orWhereIn('batch_id', $assignedBatchIds);
            })
            ->latest()
            ->take(5)
            ->get();

        $upcomingHolidays = Holiday::where('tenant_id', app('tenant_id'))
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
                'present' => Attendance::whereMonth('date', $date->month)
                    ->whereYear('date', $date->year)->where('status', 'present')
                    ->whereIn('batch_id', $assignedBatchIds)->count(),
                'absent' => Attendance::whereMonth('date', $date->month)
                    ->whereYear('date', $date->year)->where('status', 'absent')
                    ->whereIn('batch_id', $assignedBatchIds)->count(),
                'late' => Attendance::whereMonth('date', $date->month)
                    ->whereYear('date', $date->year)->where('status', 'late')
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

        $recentActivity = collect();

        foreach ($recentStudents as $student) {
            $recentActivity->push([
                'type' => 'student',
                'title' => $student->name,
                'subtitle' => $student->coachingClass?->name ?? '',
                'date' => $student->created_at,
                'url' => "/students/{$student->id}",
            ]);
        }

        foreach ($recentEnrollments as $enrollment) {
            $recentActivity->push([
                'type' => 'enrollment',
                'title' => $enrollment->student?->name ?? 'Unknown',
                'subtitle' => $enrollment->batch?->name ?? '',
                'date' => $enrollment->created_at,
                'url' => "/batches/{$enrollment->batch_id}",
            ]);
        }

        foreach ($recentFeePayments as $payment) {
            $recentActivity->push([
                'type' => 'fee',
                'title' => $payment->student?->name ?? 'Unknown',
                'subtitle' => number_format($payment->amount_paid, 0),
                'date' => $payment->created_at,
                'url' => '/fees',
            ]);
        }

        $recentActivity = $recentActivity->sortByDesc('date')->take(5)->values()->all();

        return Inertia::render('dashboard', [
            'planFeatures' => $features,
            'stats' => $stats,
            'statsTrend' => $statsTrend,
            'feeStats' => $feeStats,
            'monthlyRevenue' => $monthlyRevenue,
            'pendingApprovals' => 0,
            'lowCapacityBatches' => [],
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
            'recentActivity' => $recentActivity,
        ]);
    }
}
