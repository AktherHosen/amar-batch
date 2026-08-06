<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEnrollmentRequest;
use App\Models\Batch;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function store(StoreEnrollmentRequest $request, Batch $batch)
    {
        $existing = Enrollment::where('student_id', $request->student_id)
            ->where('batch_id', $batch->id)
            ->first();

        if ($existing) {
            return back()->withErrors(['student_id' => 'This student is already enrolled in this batch.']);
        }

        Enrollment::create([
            'student_id' => $request->student_id,
            'batch_id' => $batch->id,
            'enrolled_at' => now(),
            'status' => 'active',
        ]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Student enrolled successfully.']);
    }

    public function update(Request $request, Enrollment $enrollment)
    {
        $request->validate([
            'status' => 'required|in:active,completed,dropped',
        ]);

        $enrollment->update(['status' => $request->status]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Enrollment status updated.']);
    }

    public function destroy(Enrollment $enrollment)
    {
        $enrollment->delete();

        return back()->with('toast', ['type' => 'success', 'message' => 'Student unenrolled successfully.']);
    }
}
