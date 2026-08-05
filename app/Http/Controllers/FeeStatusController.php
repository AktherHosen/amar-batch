<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFeeStatusRequest;
use App\Http\Requests\UpdateFeeStatusRequest;
use App\Models\Batch;
use App\Models\FeeStatus;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeeStatusController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (!$request->user()->isAdmin()) {
                abort(403);
            }
            return $next($request);
        });
    }

    public function index(Request $request): Response
    {
        $year = $request->input('year', date('Y'));

        $query = FeeStatus::with(['student.coachingClass', 'batch'])
            ->where('year', $year);

        if ($search = $request->input('search')) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $feeStatuses = $query->orderBy('month')->get();

        $students = Student::with('coachingClass')->orderBy('name')->get();
        $batches = Batch::orderBy('name')->get();

        $months = range(1, 12);
        $monthNames = [
            1 => 'January', 2 => 'February', 3 => 'March', 4 => 'April',
            5 => 'May', 6 => 'June', 7 => 'July', 8 => 'August',
            9 => 'September', 10 => 'October', 11 => 'November', 12 => 'December',
        ];

        $grid = [];
        foreach ($feeStatuses as $fee) {
            $key = "{$fee->student_id}_{$fee->batch_id}";
            if (!isset($grid[$key])) {
                $enrollment = \App\Models\Enrollment::where('student_id', $fee->student_id)
                    ->where('batch_id', $fee->batch_id)
                    ->where('status', 'active')
                    ->first();

                $enrolledAt = $fee->student->joined_at
                    ? $fee->student->joined_at->format('Y-m-d')
                    : ($enrollment ? $enrollment->created_at->format('Y-m-d') : null);

                $grid[$key] = [
                    'student' => $fee->student,
                    'batch' => $fee->batch,
                    'enrolled_at' => $enrolledAt,
                    'months' => [],
                ];
            }
            $grid[$key]['months'][$fee->month] = $fee;
        }

        return Inertia::render('fees/index', [
            'feeGrid' => array_values($grid),
            'students' => $students,
            'batches' => $batches,
            'months' => $months,
            'monthNames' => $monthNames,
            'year' => (int) $year,
            'filters' => $request->only(['search', 'year']),
        ]);
    }

    public function create(): Response
    {
        $students = Student::with('coachingClass')->orderBy('name')->get();
        $batches = Batch::orderBy('name')->get();
        $enrollments = \App\Models\Enrollment::where('status', 'active')
            ->with('student', 'batch')
            ->get()
            ->map(fn($e) => [
                'student' => $e->student,
                'batch' => $e->batch,
                'enrolled_at' => $e->student->joined_at
                    ? $e->student->joined_at->format('Y-m-d')
                    : $e->created_at->format('Y-m-d'),
            ]);

        return Inertia::render('fees/create', [
            'students' => $students,
            'batches' => $batches,
            'enrollments' => $enrollments,
        ]);
    }

    public function store(StoreFeeStatusRequest $request): RedirectResponse
    {
        FeeStatus::updateOrCreate(
            [
                'student_id' => $request->student_id,
                'batch_id' => $request->batch_id,
                'month' => $request->month,
                'year' => $request->year,
            ],
            [
                'amount_paid' => $request->amount_paid,
                'notes' => $request->notes ?: null,
            ]
        );

        return to_route('fees.index')->with('toast', ['type' => 'success', 'message' => 'Fee record saved successfully.']);
    }

    public function edit(FeeStatus $fee): Response
    {
        $fee->load(['student', 'batch']);
        $students = Student::with('coachingClass')->orderBy('name')->get();
        $batches = Batch::orderBy('name')->get();
        $enrollments = \App\Models\Enrollment::where('status', 'active')
            ->with('student', 'batch')
            ->get()
            ->map(fn($e) => [
                'student' => $e->student,
                'batch' => $e->batch,
                'enrolled_at' => $e->student->joined_at
                    ? $e->student->joined_at->format('Y-m-d')
                    : $e->created_at->format('Y-m-d'),
            ]);

        return Inertia::render('fees/edit', [
            'fee' => $fee,
            'students' => $students,
            'batches' => $batches,
            'enrollments' => $enrollments,
        ]);
    }

    public function update(UpdateFeeStatusRequest $request, FeeStatus $fee): RedirectResponse
    {
        $fee->update([
            'student_id' => $request->student_id,
            'batch_id' => $request->batch_id,
            'month' => $request->month,
            'year' => $request->year,
            'amount_paid' => $request->amount_paid,
            'notes' => $request->notes ?: null,
        ]);

        return to_route('fees.index')->with('toast', ['type' => 'success', 'message' => 'Fee record updated successfully.']);
    }

    public function destroy(FeeStatus $fee): RedirectResponse
    {
        $fee->delete();

        return to_route('fees.index')->with('toast', ['type' => 'success', 'message' => 'Fee record deleted successfully.']);
    }
}
