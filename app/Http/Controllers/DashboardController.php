<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\FeeStatus;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $stats = [
            'total_students' => Student::count(),
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
}
