<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAttendanceRequest;
use App\Models\Attendance;
use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\InAppNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Attendance::class);

        $query = Attendance::with(['student.coachingClass', 'batch']);

        if ($request->has('batch_id') && $request->batch_id) {
            $query->where('batch_id', $request->batch_id);
        }

        if ($request->has('date') && $request->date) {
            $query->whereDate('date', $request->date);
        }

        $attendances = $query->orderBy('date', 'desc')->paginate(10)->withQueryString();
        $batches = Batch::where('tenant_id', $request->user()->tenant_id)->where('status', '!=', 'completed')->orderBy('name')->get();

        return Inertia::render('attendance/index', [
            'attendances' => $attendances,
            'batches' => $batches,
            'filters' => $request->only(['batch_id', 'date']),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Attendance::class);

        $tenantId = $request->user()->tenant_id;
        $batches = Batch::where('tenant_id', $tenantId)->where('status', '!=', 'completed')->orderBy('name')->get();
        $selectedBatch = $request->batch_id;
        $selectedDate = $request->date ?? now()->toDateString();

        $students = [];
        if ($selectedBatch) {
            $students = Enrollment::where('tenant_id', $tenantId)->where('batch_id', $selectedBatch)
                ->where('status', 'active')
                ->whereHas('student', fn ($q) => $q->where('tenant_id', $tenantId)->where('status', 'active'))
                ->with('student')
                ->get()
                ->map(function ($enrollment) use ($selectedBatch, $selectedDate) {
                    $existing = Attendance::where('student_id', $enrollment->student_id)
                        ->where('batch_id', $selectedBatch)
                        ->whereDate('date', $selectedDate)
                        ->first();

                    return [
                        'id' => $enrollment->student->id,
                        'name' => $enrollment->student->name,
                        'status' => $existing->status ?? null,
                        'attendance_id' => $existing->id ?? null,
                        'notes' => $existing->notes ?? '',
                    ];
                });
        }

        return Inertia::render('attendance/create', [
            'batches' => $batches,
            'students' => $students,
            'selectedBatch' => $selectedBatch,
            'selectedDate' => $selectedDate,
        ]);
    }

    public function store(StoreAttendanceRequest $request): RedirectResponse
    {
        $batch = Batch::find($request->batch_id);
        $this->authorize('update', $batch);

        $attendances = $request->attendances;

        foreach ($attendances as $item) {
            if ($item['status'] === null) {
                Attendance::where('student_id', $item['student_id'])
                    ->where('batch_id', $request->batch_id)
                    ->whereDate('date', $request->date)
                    ->delete();
            } else {
                Attendance::updateOrCreate(
                    [
                        'student_id' => $item['student_id'],
                        'batch_id' => $request->batch_id,
                        'date' => $request->date,
                    ],
                    [
                        'status' => $item['status'],
                        'marked_by' => $request->user()->id,
                        'notes' => $item['notes'] ?? null,
                    ]
                );
            }
        }

        $count = count(array_filter($attendances, fn($a) => $a['status'] !== null));

        InAppNotification::create([
            'user_id' => $request->user()->id,
            'title' => 'Attendance Marked',
            'message' => "{$count} students marked for {$batch->name} on {$request->date}.",
            'type' => 'attendance',
            'action_url' => route('attendance.index'),
        ]);

        return to_route('attendance.index')->with('toast', ['type' => 'success', 'message' => 'Attendance marked successfully.']);
    }

    public function edit(Attendance $attendance): Response
    {
        $this->authorize('update', $attendance);

        $attendance->load(['student', 'batch']);

        return Inertia::render('attendance/edit', [
            'attendance' => $attendance,
        ]);
    }

    public function update(Request $request, Attendance $attendance): RedirectResponse
    {
        $this->authorize('update', $attendance);

        $validated = $request->validate([
            'status' => 'required|in:present,absent,late',
            'notes' => 'nullable|string|max:500',
        ]);

        $attendance->update($validated);

        return to_route('attendance.index')->with('toast', ['type' => 'success', 'message' => 'Attendance updated successfully.']);
    }

    public function destroy(Attendance $attendance): RedirectResponse
    {
        $this->authorize('delete', $attendance);

        $attendance->delete();

        return back()->with('toast', ['type' => 'success', 'message' => 'Attendance record deleted.']);
    }

    public function import(Request $request): RedirectResponse
    {
        $this->authorize('create', Attendance::class);

        $rows = $request->input('rows', []);

        foreach ($rows as $row) {
            Attendance::updateOrCreate(
                [
                    'student_id' => $row['student_id'],
                    'batch_id' => $row['batch_id'],
                    'date' => $row['date'],
                ],
                [
                    'status' => $row['status'] ?? 'present',
                    'marked_by' => $request->user()->id,
                    'notes' => $row['notes'] ?? null,
                ]
            );
        }

        return to_route('attendance.index')->with('toast', ['type' => 'success', 'message' => count($rows) . ' attendance records imported successfully.']);
    }
}
