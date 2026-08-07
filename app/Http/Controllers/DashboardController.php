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

        $batchHistory = [
            'completed' => Batch::where('status', 'completed')->count(),
            'active' => Batch::where('status', 'active')->count(),
        ];

        $attendanceTrend = collect(range(5, 0))->map(function ($i) {
            $date = now()->subMonths($i);
            return [
                'month' => $date->format('M Y'),
                'present' => Attendance::whereDate('date', $date)->where('status', 'present')->count(),
                'absent' => Attendance::whereDate('date', $date)->where('status', 'absent')->count(),
                'late' => Attendance::whereDate('date', $date)->where('status', 'late')->count(),
            ];
        });

        $enrollmentTrend = collect(range(5, 0))->map(function ($i) {
            $date = now()->subMonths($i);
            return [
                'month' => $date->format('M Y'),
                'enrollments' => Enrollment::whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)->count(),
            ];
        });

        $feeTrend = collect(range(5, 0))->map(function ($i) {
            $date = now()->subMonths($i);
            return [
                'month' => $date->format('M Y'),
                'collected' => (float) FeeStatus::whereMonth('created_at', $date->month)
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
            'assignedBatches' => $assignedBatches,
            'batchHistory' => $batchHistory,
            'attendanceTrend' => $attendanceTrend,
            'enrollmentTrend' => $enrollmentTrend,
            'feeTrend' => $feeTrend,
        ]);
    }
}
