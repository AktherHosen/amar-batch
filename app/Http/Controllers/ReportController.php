<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Batch;
use App\Models\Branch;
use App\Models\Enrollment;
use App\Models\FeeStatus;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', \App\Models\Student::class);

        $tenantId = app('tenant_id');
        $branchId = $request->input('branch_id');
        $batchId = $request->input('batch_id');
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $batches = Batch::where('tenant_id', $tenantId)
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->orderBy('name')
            ->get();

        $branches = Branch::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $scopeByBranch = fn ($q) => $q->whereHas(
            'batch',
            fn ($b) => $b->where('branch_id', $branchId),
        );

        // Attendance summary
        $attendanceQuery = Attendance::where('tenant_id', $tenantId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->when($branchId, $scopeByBranch);

        if ($batchId) {
            $attendanceQuery->where('batch_id', $batchId);
        }

        $attendanceSummary = [
            'present' => (clone $attendanceQuery)->where('status', 'present')->count(),
            'absent' => (clone $attendanceQuery)->where('status', 'absent')->count(),
            'late' => (clone $attendanceQuery)->where('status', 'late')->count(),
        ];

        // Fee collection summary
        $feeQuery = FeeStatus::where('tenant_id', $tenantId)
            ->where('month', $month)
            ->where('year', $year)
            ->when($branchId, $scopeByBranch);

        if ($batchId) {
            $feeQuery->where('batch_id', $batchId);
        }

        $totalCollected = (clone $feeQuery)->sum('amount_paid');

        // Calculate due amount by joining with coaching_classes
        $feeDueQuery = FeeStatus::where('fee_statuses.tenant_id', $tenantId)
            ->where('fee_statuses.month', $month)
            ->where('fee_statuses.year', $year)
            ->join('students', 'fee_statuses.student_id', '=', 'students.id')
            ->leftJoin('coaching_classes', 'students.coaching_class_id', '=', 'coaching_classes.id');

        if ($branchId) {
            $feeDueQuery->whereHas('batch', fn ($b) => $b->where('branch_id', $branchId));
        }

        if ($batchId) {
            $feeDueQuery->where('fee_statuses.batch_id', $batchId);
        }

        $totalDue = (clone $feeDueQuery)->sum('coaching_classes.default_fee');

        $feeSummary = [
            'total_collected' => $totalCollected,
            'total_due' => (float) $totalDue,
            'total_records' => (clone $feeQuery)->count(),
            'unpaid' => (clone $feeQuery)->where('amount_paid', 0)->count(),
        ];

        // Enrollment summary
        $enrollmentQuery = Enrollment::where('tenant_id', $tenantId)
            ->when($branchId, $scopeByBranch);

        if ($batchId) {
            $enrollmentQuery->where('batch_id', $batchId);
        }

        $enrollmentSummary = [
            'total' => (clone $enrollmentQuery)->count(),
            'active' => (clone $enrollmentQuery)->where('status', 'active')->count(),
            'completed' => (clone $enrollmentQuery)->where('status', 'completed')->count(),
            'dropped' => (clone $enrollmentQuery)->where('status', 'dropped')->count(),
        ];

        // Student stats
        $studentQuery = Student::where('tenant_id', $tenantId)
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId));

        if ($batchId) {
            $studentQuery->whereHas('enrollments', fn ($q) => $q->where('batch_id', $batchId)->where('status', 'active'));
        }

        $studentSummary = [
            'total' => (clone $studentQuery)->count(),
            'active' => (clone $studentQuery)->where('status', 'active')->count(),
            'inactive' => (clone $studentQuery)->where('status', 'inactive')->count(),
        ];

        // Attendance trend (12 months)
        $attendanceTrend = collect(range(11, 0))->map(function ($i) use ($tenantId, $branchId, $batchId, $scopeByBranch) {
            $date = now()->subMonths($i);
            $query = Attendance::where('tenant_id', $tenantId)
                ->whereMonth('date', $date->month)
                ->whereYear('date', $date->year)
                ->when($branchId, $scopeByBranch);

            if ($batchId) {
                $query->where('batch_id', $batchId);
            }

            return [
                'month' => $date->format('M Y'),
                'present' => (clone $query)->where('status', 'present')->count(),
                'absent' => (clone $query)->where('status', 'absent')->count(),
                'late' => (clone $query)->where('status', 'late')->count(),
            ];
        });

        // Fee trend (12 months)
        $feeTrend = collect(range(11, 0))->map(function ($i) use ($tenantId, $branchId, $batchId, $scopeByBranch) {
            $date = now()->subMonths($i);
            $query = FeeStatus::where('tenant_id', $tenantId)
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->when($branchId, $scopeByBranch);

            if ($batchId) {
                $query->where('batch_id', $batchId);
            }

            $collected = (float) (clone $query)->sum('amount_paid');

            $dueQuery = FeeStatus::where('fee_statuses.tenant_id', $tenantId)
                ->whereMonth('fee_statuses.created_at', $date->month)
                ->whereYear('fee_statuses.created_at', $date->year)
                ->join('students', 'fee_statuses.student_id', '=', 'students.id')
                ->leftJoin('coaching_classes', 'students.coaching_class_id', '=', 'coaching_classes.id');

            if ($branchId) {
                $dueQuery->whereHas('batch', fn ($b) => $b->where('branch_id', $branchId));
            }

            if ($batchId) {
                $dueQuery->where('fee_statuses.batch_id', $batchId);
            }

            $due = (float) (clone $dueQuery)->sum('coaching_classes.default_fee');

            return [
                'month' => $date->format('M Y'),
                'collected' => $collected,
                'due' => $due,
            ];
        });

        // Enrollment trend (12 months)
        $enrollmentTrend = collect(range(11, 0))->map(function ($i) use ($tenantId, $branchId, $batchId, $scopeByBranch) {
            $date = now()->subMonths($i);
            $query = Enrollment::where('tenant_id', $tenantId)
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->when($branchId, $scopeByBranch);

            if ($batchId) {
                $query->where('batch_id', $batchId);
            }

            return [
                'month' => $date->format('M Y'),
                'enrollments' => (clone $query)->count(),
            ];
        });

        // Batch performance
        $batchPerformance = $batches->map(function ($batch) {
            $enrollments = Enrollment::where('batch_id', $batch->id);
            $activeCount = (clone $enrollments)->where('status', 'active')->count();
            $totalFees = FeeStatus::where('batch_id', $batch->id)->sum('amount_paid');

            return [
                'id' => $batch->id,
                'name' => $batch->name,
                'active_students' => $activeCount,
                'total_fees_collected' => (float) $totalFees,
            ];
        });

        return Inertia::render('reports/index', [
            'batches' => $batches,
            'branches' => $branches,
            'attendanceSummary' => $attendanceSummary,
            'feeSummary' => $feeSummary,
            'enrollmentSummary' => $enrollmentSummary,
            'studentSummary' => $studentSummary,
            'attendanceTrend' => $attendanceTrend,
            'feeTrend' => $feeTrend,
            'enrollmentTrend' => $enrollmentTrend,
            'batchPerformance' => $batchPerformance,
            'filters' => $request->only(['branch_id', 'batch_id', 'month', 'year']),
        ]);
    }

    public function unpaidStudents(Request $request): Response
    {
        $this->authorize('viewAny', Student::class);

        $tenantId = app('tenant_id');
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);
        $batchId = $request->input('batch_id');

        $paidStudentBatchPairs = FeeStatus::where('tenant_id', $tenantId)
            ->where('month', $month)
            ->where('year', $year)
            ->where('amount_paid', '>', 0)
            ->pluck('student_id')
            ->unique()
            ->toArray();

        $query = Student::with(['coachingClass', 'batches'])
            ->where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->whereNotIn('id', $paidStudentBatchPairs);

        if ($batchId) {
            $query->whereHas('batches', fn ($q) => $q->where('batches.id', $batchId));
        }

        $allUnpaidStudents = $query->orderBy('name')->get();

        $studentIds = $allUnpaidStudents->pluck('id')->toArray();

        $paidRecords = FeeStatus::where('tenant_id', $tenantId)
            ->whereIn('student_id', $studentIds)
            ->where('amount_paid', '>', 0)
            ->select('student_id', 'month', 'year')
            ->get()
            ->groupBy('student_id');

        $enrolledBatches = \App\Models\Enrollment::where('tenant_id', $tenantId)
            ->whereIn('student_id', $studentIds)
            ->where('status', 'active')
            ->select('student_id', 'enrolled_at')
            ->get()
            ->groupBy('student_id');

        $now = now();
        $currentMonth = (int) $now->format('m');
        $currentYear = (int) $now->format('Y');

        $studentDueData = $allUnpaidStudents->map(function ($student) use ($paidRecords, $enrolledBatches, $currentMonth, $currentYear) {
            $defaultFee = (float) ($student->coachingClass?->default_fee ?? 0);

            $earliestEnrollment = $enrolledBatches->get($student->id)?->min('enrolled_at');

            if ($earliestEnrollment) {
                $enrollDate = \Carbon\Carbon::parse($earliestEnrollment);
                $startMonth = (int) $enrollDate->format('m');
                $startYear = (int) $enrollDate->format('Y');
            } else {
                $startMonth = 1;
                $startYear = $currentYear;
            }

            $paidMonths = collect();
            if ($studentRecords = $paidRecords->get($student->id)) {
                $paidMonths = $studentRecords->map(fn ($r) => $r['month'] . '-' . $r['year']);
            }

            $unpaidCount = 0;
            $y = $startYear;
            $m = $startMonth;

            while ($y < $currentYear || ($y === $currentYear && $m <= $currentMonth)) {
                $key = $m . '-' . $y;
                if (!$paidMonths->contains($key)) {
                    $unpaidCount++;
                }
                $m++;
                if ($m > 12) {
                    $m = 1;
                    $y++;
                }
            }

            return [
                'id' => $student->id,
                'name' => $student->name,
                'phone' => $student->phone,
                'coaching_class' => $student->coachingClass?->name,
                'default_fee' => $defaultFee,
                'unpaid_months' => $unpaidCount,
                'total_due' => $defaultFee * $unpaidCount,
                'batches' => $student->batches->map(fn ($b) => ['id' => $b->id, 'name' => $b->name]),
            ];
        });

        $students = new \Illuminate\Pagination\LengthAwarePaginator(
            $studentDueData->forPage($request->input('page', 1), 10),
            $studentDueData->count(),
            10,
            $request->input('page', 1),
            ['path' => $request->url(), 'query' => $request->query()]
        );

        $batches = Batch::where('tenant_id', $tenantId)->orderBy('name')->get(['id', 'name']);
        $monthNames = [
            1 => 'January', 2 => 'February', 3 => 'March', 4 => 'April',
            5 => 'May', 6 => 'June', 7 => 'July', 8 => 'August',
            9 => 'September', 10 => 'October', 11 => 'November', 12 => 'December',
        ];

        return Inertia::render('reports/unpaid-students', [
            'students' => $students,
            'batches' => $batches,
            'monthNames' => $monthNames,
            'filters' => $request->only(['month', 'year', 'batch_id']),
        ]);
    }

    public function branchComparison(Request $request)
    {
        $this->authorize('viewAny', Student::class);

        $tenantId = app('tenant_id');
        $branches = Branch::where('tenant_id', $tenantId)->orderBy('name')->get();

        $branchData = $branches->map(function ($branch) use ($tenantId) {
            $studentCount = Student::where('tenant_id', $tenantId)
                ->where('branch_id', $branch->id)
                ->where('status', 'active')
                ->count();

            $batchCount = Batch::where('tenant_id', $tenantId)
                ->where('branch_id', $branch->id)
                ->where('status', 'active')
                ->count();

            $activeEnrollments = Enrollment::where('tenant_id', $tenantId)
                ->where('status', 'active')
                ->whereHas('batch', fn ($q) => $q->where('branch_id', $branch->id))
                ->count();

            $feesCollected = (float) FeeStatus::where('tenant_id', $tenantId)
                ->whereHas('student', fn ($q) => $q->where('branch_id', $branch->id))
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('amount_paid');

            $totalFeesCollected = (float) FeeStatus::where('tenant_id', $tenantId)
                ->whereHas('student', fn ($q) => $q->where('branch_id', $branch->id))
                ->sum('amount_paid');

            $totalAttendance = Attendance::where('tenant_id', $tenantId)
                ->whereHas('batch', fn ($q) => $q->where('branch_id', $branch->id))
                ->whereMonth('date', now()->month)
                ->whereYear('date', now()->year)
                ->count();

            $presentCount = Attendance::where('tenant_id', $tenantId)
                ->whereHas('batch', fn ($q) => $q->where('branch_id', $branch->id))
                ->whereMonth('date', now()->month)
                ->whereYear('date', now()->year)
                ->where('status', 'present')
                ->count();

            $attendanceRate = $totalAttendance > 0
                ? round(($presentCount / $totalAttendance) * 100)
                : 0;

            return [
                'id' => $branch->id,
                'name' => $branch->name,
                'code' => $branch->code,
                'is_active' => $branch->is_active,
                'students' => $studentCount,
                'batches' => $batchCount,
                'enrollments' => $activeEnrollments,
                'fees_collected_month' => $feesCollected,
                'fees_collected_total' => $totalFeesCollected,
                'attendance_rate' => $attendanceRate,
            ];
        });

        $totals = [
            'students' => $branchData->sum('students'),
            'batches' => $branchData->sum('batches'),
            'enrollments' => $branchData->sum('enrollments'),
            'fees_collected_month' => $branchData->sum('fees_collected_month'),
            'fees_collected_total' => $branchData->sum('fees_collected_total'),
            'avg_attendance' => $branchData->pluck('attendance_rate')->filter()->count() > 0
                ? round($branchData->pluck('attendance_rate')->filter()->avg())
                : 0,
        ];

        return Inertia::render('reports/branch-comparison', [
            'branches' => $branchData->values(),
            'totals' => $totals,
        ]);
    }
}