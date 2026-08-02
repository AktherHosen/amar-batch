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
            'total_paid' => FeeStatus::where('status', 'paid')->sum('amount_paid'),
            'total_partial' => FeeStatus::where('status', 'partial')->sum('amount_paid'),
            'total_unpaid' => FeeStatus::where('status', 'unpaid')->sum('amount_due'),
            'paid_count' => FeeStatus::where('status', 'paid')->count(),
            'partial_count' => FeeStatus::where('status', 'partial')->count(),
            'unpaid_count' => FeeStatus::where('status', 'unpaid')->count(),
        ];

        $recentEnrollments = Enrollment::with(['student', 'batch'])
            ->latest()
            ->take(5)
            ->get();

        $recentFeePayments = FeeStatus::with(['student', 'batch'])
            ->where('status', '!=', 'unpaid')
            ->latest('payment_date')
            ->take(5)
            ->get();

        $todayAttendance = [
            'present' => Attendance::whereDate('date', now())->where('status', 'present')->count(),
            'absent' => Attendance::whereDate('date', now())->where('status', 'absent')->count(),
            'late' => Attendance::whereDate('date', now())->where('status', 'late')->count(),
        ];

        $recentStudents = Student::latest()->take(5)->get();

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
