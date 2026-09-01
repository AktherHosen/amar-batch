<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\CoachingClass;
use App\Models\Enrollment;
use App\Models\ExamResult;
use App\Models\FeeStatus;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ParentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = app('tenant_id');
        $now = Carbon::now();

        $children = $user->children()
            ->with([
                'coachingClass',
                'enrollments' => fn ($q) => $q->with('batch')->where('status', 'active'),
            ])
            ->get()
            ->map(function ($student) use ($tenantId, $now) {
                $totalAttendance = Attendance::where('student_id', $student->id)
                    ->whereHas('batch', fn ($q) => $q->where('batches.tenant_id', $tenantId))
                    ->count();

                $presentCount = Attendance::where('student_id', $student->id)
                    ->where('status', 'present')
                    ->whereHas('batch', fn ($q) => $q->where('batches.tenant_id', $tenantId))
                    ->count();

                $absentCount = Attendance::where('student_id', $student->id)
                    ->where('status', 'absent')
                    ->whereHas('batch', fn ($q) => $q->where('batches.tenant_id', $tenantId))
                    ->count();

                $attendancePercent = $totalAttendance > 0
                    ? round(($presentCount / $totalAttendance) * 100)
                    : 0;

                $totalPaid = FeeStatus::where('student_id', $student->id)
                    ->whereHas('batch', fn ($q) => $q->where('batches.tenant_id', $tenantId))
                    ->sum('amount_paid');

                $currentMonthPaid = FeeStatus::where('student_id', $student->id)
                    ->where('month', $now->month)
                    ->where('year', $now->year)
                    ->whereHas('batch', fn ($q) => $q->where('batches.tenant_id', $tenantId))
                    ->sum('amount_paid');

                $feeStatusesAll = FeeStatus::where('student_id', $student->id)
                    ->whereHas('batch', fn ($q) => $q->where('batches.tenant_id', $tenantId))
                    ->get();

                $defaultFee = (float) ($student->coachingClass?->default_fee ?? 0);
                $joinedAt = $student->joined_at ? Carbon::parse($student->joined_at) : null;

                $totalExpected = 0;
                if ($joinedAt && $defaultFee > 0) {
                    $start = $joinedAt->copy()->startOfMonth();
                    $end = $now->copy()->subMonth()->startOfMonth();

                    while ($start->lte($end)) {
                        $m = $start->month;
                        $y = $start->year;

                        $existing = $feeStatusesAll->where('month', $m)->where('year', $y)->first();

                        if ($existing) {
                            $totalExpected += (float) $existing->amount_due;
                        } else {
                            $isFirstMonth = $joinedAt->month === $m && $joinedAt->year === $y;
                            $totalExpected += ($isFirstMonth && $joinedAt->day > 15) ? round($defaultFee / 2, 2) : $defaultFee;
                        }

                        $start->addMonth();
                    }
                }

                $totalDues = max(0, $totalExpected - $totalPaid);

                $recentExams = ExamResult::where('student_id', $student->id)
                    ->with('exam')
                    ->latest()
                    ->take(3)
                    ->get()
                    ->map(fn ($r) => [
                        'exam_title' => $r->exam->title ?? '—',
                        'subject' => $r->exam->subject ?? '—',
                        'marks_obtained' => $r->marks_obtained,
                        'total_marks' => $r->exam->total_marks ?? 0,
                        'passing_marks' => $r->exam->passing_marks ?? 0,
                        'date' => $r->exam->exam_date ?? null,
                    ]);

                $recentAttendance = Attendance::where('student_id', $student->id)
                    ->whereHas('batch', fn ($q) => $q->where('batches.tenant_id', $tenantId))
                    ->latest('date')
                    ->take(7)
                    ->get(['date', 'status'])
                    ->map(fn ($a) => ['date' => $a->date->format('M d'), 'status' => $a->status]);

                $batchNames = $student->enrollments->pluck('batch.name')->filter()->values()->toArray();

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'code' => $student->code,
                    'photo' => $student->photo,
                    'coaching_class' => $student->coachingClass?->name,
                    'active_batches' => $student->enrollments->count(),
                    'batch_names' => $batchNames,
                    'attendance_percent' => $attendancePercent,
                    'present_count' => $presentCount,
                    'absent_count' => $absentCount,
                    'total_attendance' => $totalAttendance,
                    'total_paid' => (float) $totalPaid,
                    'current_month_paid' => (float) $currentMonthPaid,
                    'recent_exams' => $recentExams,
                    'recent_attendance' => $recentAttendance,
                ];
            });

        return Inertia::render('portal/index', [
            'children' => $children,
        ]);
    }

    public function show(Request $request, int $studentId): Response
    {
        $user = $request->user();
        $tenantId = app('tenant_id');

        $student = $user->children()
            ->where('students.id', $studentId)
            ->with([
                'enrollments' => fn ($q) => $q->with('batch')->latest(),
            ])
            ->firstOrFail();

        $student->coaching_class = $student->coachingClass?->name;
        $student->makeHidden(['coachingClass']);

        $attendanceSummary = Attendance::where('student_id', $student->id)
            ->whereHas('batch', fn ($q) => $q->where('batches.tenant_id', $tenantId))
            ->selectRaw('YEAR(date) as year, MONTH(date) as month, status, COUNT(*) as count')
            ->groupBy('year', 'month', 'status')
            ->get()
            ->groupBy('year')
            ->map(function ($yearGroup) {
                return $yearGroup->groupBy('month')
                    ->mapWithKeys(function ($monthGroup, $month) {
                        return [$month => $monthGroup->pluck('count', 'status')->toArray()];
                    });
            });

        $feeStatuses = FeeStatus::where('student_id', $student->id)
            ->whereHas('batch', fn ($q) => $q->where('batches.tenant_id', $tenantId))
            ->with('batch')
            ->latest()
            ->get();

        $examResults = ExamResult::where('student_id', $student->id)
            ->with('exam.batch')
            ->latest()
            ->get();

        $totalPaid = $feeStatuses->sum('amount_paid');

        $defaultFee = (float) ($student->coachingClass?->default_fee ?? 0);
        $joinedAt = $student->joined_at ? Carbon::parse($student->joined_at) : null;
        $now = Carbon::now();

        $totalExpected = 0;
        if ($joinedAt && $defaultFee > 0) {
            $start = $joinedAt->copy()->startOfMonth();
            $end = $now->copy()->subMonth()->startOfMonth();

            while ($start->lte($end)) {
                $m = $start->month;
                $y = $start->year;

                $existing = $feeStatuses->where('month', $m)->where('year', $y)->first();

                if ($existing) {
                    $totalExpected += (float) $existing->amount_due;
                } else {
                    $isFirstMonth = $joinedAt->month === $m && $joinedAt->year === $y;
                    $totalExpected += ($isFirstMonth && $joinedAt->day > 15) ? round($defaultFee / 2, 2) : $defaultFee;
                }

                $start->addMonth();
            }
        }

        $totalDues = max(0, $totalExpected - $totalPaid);

        $totalAttendance = $attendanceSummary->flatten()->sum();
        $presentTotal = 0;
        foreach ($attendanceSummary as $yearData) {
            foreach ($yearData as $monthData) {
                $presentTotal += $monthData['present'] ?? 0;
            }
        }
        $attendancePercent = $totalAttendance > 0
            ? round(($presentTotal / $totalAttendance) * 100)
            : 0;

        return Inertia::render('portal/show', [
            'student' => $student,
            'attendanceSummary' => $attendanceSummary,
            'feeStatuses' => $feeStatuses,
            'examResults' => $examResults,
            'totalPaid' => (float) $totalPaid,
            'totalDues' => (float) $totalDues,
            'attendancePercent' => $attendancePercent,
        ]);
    }
}
