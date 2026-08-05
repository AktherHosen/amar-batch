<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAttendanceRequest;
use App\Models\Attendance;
use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Attendance::with(['student', 'batch']);

        if ($request->has('batch_id') && $request->batch_id) {
            $query->where('batch_id', $request->batch_id);
        }

        if ($request->has('date') && $request->date) {
            $query->whereDate('date', $request->date);
        }

        $attendances = $query->orderBy('date', 'desc')->paginate(15);
        $batches = Batch::orderBy('name')->get();

        return Inertia::render('attendance/index', [
            'attendances' => $attendances,
            'batches' => $batches,
            'filters' => $request->only(['batch_id', 'date']),
        ]);
    }

    public function create(Request $request): Response
    {
        $batches = Batch::orderBy('name')->get();
        $selectedBatch = $request->batch_id;
        $selectedDate = $request->date ?? now()->toDateString();

        $students = [];
        if ($selectedBatch) {
            $students = Enrollment::where('batch_id', $selectedBatch)
                ->where('status', 'active')
                ->whereHas('student', fn ($q) => $q->where('status', 'active'))
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
                        'status' => $existing?->status ?? 'present',
                        'attendance_id' => $existing?->id,
                        'notes' => $existing?->notes ?? '',
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

    public function store(StoreAttendanceRequest $request)
    {
        $attendances = $request->attendances;

        foreach ($attendances as $item) {
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

        return to_route('attendance.index')->with('toast', ['type' => 'success', 'message' => 'Attendance marked successfully.']);
    }

    public function destroy(Attendance $attendance)
    {
        $attendance->delete();

        return back()->with('toast', ['type' => 'success', 'message' => 'Attendance record deleted.']);
    }
}
