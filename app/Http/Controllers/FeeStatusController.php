<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFeeStatusRequest;
use App\Http\Requests\UpdateFeeStatusRequest;
use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\FeeStatus;
use App\Models\InAppNotification;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class FeeStatusController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (! $request->user()->isAdmin()) {
                abort(403);
            }

            return $next($request);
        });
    }

    public function index(Request $request): Response
    {
        $year = $request->input('year', date('Y'));
        $batchId = $request->input('batch_id');

        $years = FeeStatus::query()
            ->select('year')
            ->distinct()
            ->orderByDesc('year')
            ->pluck('year')
            ->map(fn ($y) => (int) $y)
            ->toArray();

        $yearOptions = array_values(array_unique(array_merge(
            $years,
            [(int) date('Y')],
        )));
        sort($yearOptions);

        $query = FeeStatus::with(['student.coachingClass', 'batch'])
            ->where('year', $year)
            ->whereHas('student', fn ($q) => $q->where('status', 'active'));

        if ($batchId) {
            $query->where('batch_id', $batchId);
        }

        if ($search = $request->input('search')) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $feeStatuses = $query->orderBy('month')->get();

        $tenantId = app('tenant_id');
        $students = Student::with('coachingClass')
            ->where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->orderBy('name')
            ->get();

        $months = range(1, 12);
        $monthNames = [
            1 => 'January', 2 => 'February', 3 => 'March', 4 => 'April',
            5 => 'May', 6 => 'June', 7 => 'July', 8 => 'August',
            9 => 'September', 10 => 'October', 11 => 'November', 12 => 'December',
        ];

        $activeEnrollments = Enrollment::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->with('student.coachingClass', 'batch')
            ->get();

        /** @var array<string, array{student: Student, batch: Batch, enrolled_at: string|null, months: array<int, FeeStatus>}> $grid */
        $grid = [];
        foreach ($activeEnrollments as $enrollment) {
            $student = $enrollment->student;
            if (! $student || $student->status !== 'active') {
                continue;
            }
            $key = "{$enrollment->student_id}_{$enrollment->batch_id}";
            $enrolledAt = $student->joined_at
                ? Carbon::parse($student->joined_at)->format('Y-m-d')
                : $enrollment->enrolled_at?->format('Y-m-d');

            $grid[$key] = [
                'student' => $student,
                'batch' => $enrollment->batch,
                'enrolled_at' => $enrolledAt,
                'months' => [],
            ];
        }

        foreach ($feeStatuses as $fee) {
            $key = "{$fee->student_id}_{$fee->batch_id}";
            if (! isset($grid[$key])) {
                $enrolledAt = $fee->student->joined_at
                    ? Carbon::parse($fee->student->joined_at)->format('Y-m-d')
                    : null;

                $grid[$key] = [
                    'student' => $fee->student,
                    'batch' => $fee->batch,
                    'enrolled_at' => $enrolledAt,
                    'months' => [],
                ];
            }
            $grid[$key]['months'][$fee->month] = $fee;
        }

        $batches = Batch::where('tenant_id', $tenantId)->orderBy('name')->get();

        $enrollments = $activeEnrollments->map(fn (Enrollment $e): array => [
            'student' => $e->student,
            'batch' => $e->batch,
            'enrolled_at' => $e->student->joined_at
                ? Carbon::parse($e->student->joined_at)->format('Y-m-d')
                : $e->enrolled_at?->format('Y-m-d'),
        ]);

        return Inertia::render('fees/index', [
            'feeGrid' => array_values($grid),
            'students' => $students,
            'batches' => $batches,
            'enrollments' => $enrollments,
            'months' => $months,
            'monthNames' => $monthNames,
            'year' => (int) $year,
            'yearOptions' => $yearOptions,
            'filters' => $request->only(['search', 'year', 'batch_id']),
        ]);
    }

    public function create(Request $request): Response
    {
        $tenantId = app('tenant_id');
        $students = Student::with('coachingClass')->where('tenant_id', $tenantId)->where('status', 'active')->orderBy('name')->get();
        $batches = Batch::where('tenant_id', $tenantId)->orderBy('name')->get();
        $enrollments = Enrollment::where('tenant_id', $tenantId)->where('status', 'active')
            ->with('student', 'batch')
            ->get()
            ->map(fn (Enrollment $e): array => [
                'student' => $e->student,
                'batch' => $e->batch,
                'enrolled_at' => $e->student->joined_at
                    ? Carbon::parse($e->student->joined_at)->format('Y-m-d')
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
        $student = Student::find($request->student_id);

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

        InAppNotification::create([
            'user_id' => $request->user()->id,
            'title' => 'Fee Payment Recorded',
            'message' => "{$student->name} — {$request->amount_paid} recorded for {$request->month}/{$request->year}.",
            'type' => 'fee',
            'action_url' => route('fees.index'),
        ]);

        return to_route('fees.index')->with('toast', ['type' => 'success', 'message' => 'Fee record saved successfully.']);
    }

    public function edit(Request $request, FeeStatus $fee): Response
    {
        $fee->load(['student', 'batch']);
        $tenantId = app('tenant_id');
        $students = Student::with('coachingClass')->where('tenant_id', $tenantId)->where('status', 'active')->orderBy('name')->get();
        $batches = Batch::where('tenant_id', $tenantId)->orderBy('name')->get();
        $enrollments = Enrollment::where('tenant_id', $tenantId)->where('status', 'active')
            ->with('student', 'batch')
            ->get()
            ->map(fn (Enrollment $e): array => [
                'student' => $e->student,
                'batch' => $e->batch,
                'enrolled_at' => $e->student->joined_at
                    ? Carbon::parse($e->student->joined_at)->format('Y-m-d')
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

    public function destroyStudentBatch(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'student_id' => ['required', 'integer'],
            'batch_id' => ['required', 'integer'],
        ]);

        FeeStatus::where('student_id', $data['student_id'])
            ->where('batch_id', $data['batch_id'])
            ->delete();

        return to_route('fees.index')->with('toast', ['type' => 'success', 'message' => 'Fee record deleted successfully.']);
    }

    public function import(Request $request): RedirectResponse
    {
        $rows = $request->input('rows', []);

        foreach ($rows as $row) {
            FeeStatus::updateOrCreate(
                [
                    'student_id' => $row['student_id'],
                    'batch_id' => $row['batch_id'],
                    'month' => $row['month'],
                    'year' => $row['year'],
                ],
                [
                    'amount_paid' => $row['amount_paid'] ?? 0,
                    'notes' => $row['notes'] ?? null,
                ]
            );
        }

        return to_route('fees.index')->with('toast', ['type' => 'success', 'message' => count($rows) . ' fee records imported successfully.']);
    }
}
