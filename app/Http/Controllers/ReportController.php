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

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', \App\Models\Student::class);

        $tenantId = $request->user()->tenant_id;
        $batchId = $request->input('batch_id');
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $batches = Batch::where('tenant_id', $tenantId)->orderBy('name')->get();

        // Attendance summary
        $attendanceQuery = Attendance::where('tenant_id', $tenantId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year);

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
            ->where('year', $year);

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
        $enrollmentQuery = Enrollment::where('tenant_id', $tenantId);
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
        $studentQuery = Student::where('tenant_id', $tenantId);
        $studentSummary = [
            'total' => (clone $studentQuery)->count(),
            'active' => (clone $studentQuery)->where('status', 'active')->count(),
            'inactive' => (clone $studentQuery)->where('status', 'inactive')->count(),
        ];

        // Attendance trend (12 months)
        $attendanceTrend = collect(range(11, 0))->map(function ($i) use ($tenantId, $batchId) {
            $date = now()->subMonths($i);
            $query = Attendance::where('tenant_id', $tenantId)
                ->whereMonth('date', $date->month)
                ->whereYear('date', $date->year);

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
        $feeTrend = collect(range(11, 0))->map(function ($i) use ($tenantId, $batchId) {
            $date = now()->subMonths($i);
            $query = FeeStatus::where('tenant_id', $tenantId)
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year);

            if ($batchId) {
                $query->where('batch_id', $batchId);
            }

            $collected = (float) (clone $query)->sum('amount_paid');

            $dueQuery = FeeStatus::where('fee_statuses.tenant_id', $tenantId)
                ->whereMonth('fee_statuses.created_at', $date->month)
                ->whereYear('fee_statuses.created_at', $date->year)
                ->join('students', 'fee_statuses.student_id', '=', 'students.id')
                ->leftJoin('coaching_classes', 'students.coaching_class_id', '=', 'coaching_classes.id');

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
        $enrollmentTrend = collect(range(11, 0))->map(function ($i) use ($tenantId, $batchId) {
            $date = now()->subMonths($i);
            $query = Enrollment::where('tenant_id', $tenantId)
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year);

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
            'attendanceSummary' => $attendanceSummary,
            'feeSummary' => $feeSummary,
            'enrollmentSummary' => $enrollmentSummary,
            'studentSummary' => $studentSummary,
            'attendanceTrend' => $attendanceTrend,
            'feeTrend' => $feeTrend,
            'enrollmentTrend' => $enrollmentTrend,
            'batchPerformance' => $batchPerformance,
            'filters' => $request->only(['batch_id', 'month', 'year']),
        ]);
    }
}
