<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEnrollmentRequest;
use App\Models\Batch;
use App\Models\BatchHistory;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function store(StoreEnrollmentRequest $request, Batch $batch): RedirectResponse
    {
        $existing = Enrollment::where('student_id', $request->student_id)
            ->where('batch_id', $batch->id)
            ->first();

        if ($existing) {
            return back()->withErrors(['student_id' => 'This student is already enrolled in this batch.']);
        }

        $enrolledAt = $request->input('enrolled_at') ?? now()->toDateString();

        if ($batch->start_date && $enrolledAt < $batch->start_date->format('Y-m-d')) {
            return back()->withErrors(['enrolled_at' => 'Enrollment date cannot be before the batch start date (' . $batch->start_date->format('Y-m-d') . ').']);
        }

        $student = Student::find($request->student_id);

        $enrollment = Enrollment::create([
            'student_id' => $request->student_id,
            'batch_id' => $batch->id,
            'enrolled_at' => $enrolledAt,
            'status' => 'active',
        ]);

        BatchHistory::create([
            'batch_id' => $batch->id,
            'student_id' => $request->student_id,
            'action' => 'enrolled',
            'action_date' => $enrollment->enrolled_at,
            'user_id' => $request->user()->id,
        ]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Student enrolled successfully.']);
    }

    public function update(Request $request, Enrollment $enrollment): RedirectResponse
    {
        $request->validate([
            'status' => 'required|in:active,completed,dropped',
        ]);

        $enrollment->update(['status' => $request->status]);

        BatchHistory::create([
            'batch_id' => $enrollment->batch_id,
            'student_id' => $enrollment->student_id,
            'action' => $request->status,
            'action_date' => now()->toDateString(),
            'user_id' => $request->user()->id,
        ]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Enrollment status updated.']);
    }

    public function destroy(Enrollment $enrollment, Request $request): RedirectResponse
    {
        BatchHistory::create([
            'batch_id' => $enrollment->batch_id,
            'student_id' => $enrollment->student_id,
            'action' => 'removed',
            'action_date' => now()->toDateString(),
            'user_id' => $request->user()->id,
        ]);

        $enrollment->delete();

        return back()->with('toast', ['type' => 'success', 'message' => 'Student unenrolled successfully.']);
    }
}
