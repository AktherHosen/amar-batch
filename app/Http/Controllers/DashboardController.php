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

        $stats = [
            'total_students' => Enrollment::where('status', 'active')
                ->whereIn('batch_id', $assignedBatchIds)
                ->distinct('student_id')
                ->count('student_id'),
            'total_teachers' => null,
            'active_batches' => $assignedBatchIds->count(),
            'total_enrollments' => Enrollment::where('status', 'active')
                ->whereIn('batch_id', $assignedBatchIds)
                ->count(),
        ];

        $feeStats = [
            'total_collected' => FeeStatus::whereIn('batch_id', $assignedBatchIds)->sum('amount_paid'),
            'total_records' => FeeStatus::whereIn('batch_id', $assignedBatchIds)->count(),
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
            'present' => Attendance::whereDate('date', now())->where('status', 'present')
                ->whereIn('batch_id', $assignedBatchIds)->count(),
            'absent' => Attendance::whereDate('date', now())->where('status', 'absent')
                ->whereIn('batch_id', $assignedBatchIds)->count(),
            'late' => Attendance::whereDate('date', now())->where('status', 'late')
                ->whereIn('batch_id', $assignedBatchIds)->count(),
        ];

        $recentStudents = Student::with('coachingClass')
            ->whereHas('enrollments', fn ($q) => $q->whereIn('batch_id', $assignedBatchIds)->where('status', 'active'))
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'feeStats' => $feeStats,
            'recentEnrollments' => $recentEnrollments,
            'recentFeePayments' => $recentFeePayments,
            'todayAttendance' => $todayAttendance,
            'recentStudents' => $recentStudents,
        ]);
    }
}
