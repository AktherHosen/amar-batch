<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFeeStatusRequest;
use App\Http\Requests\UpdateFeeStatusRequest;
use App\Models\Batch;
use App\Models\FeeStatus;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class FeeStatusController extends Controller
{
    public function index(Request $request): Response
    {
        $query = FeeStatus::with(['student', 'batch']);

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $feeStatuses = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('fees/index', [
            'feeStatuses' => $feeStatuses,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        $students = Student::orderBy('name')->get();
        $batches = Batch::orderBy('name')->get();
        $enrollments = \App\Models\Enrollment::where('status', 'active')->with('student', 'batch')->get();

        return Inertia::render('fees/create', [
            'students' => $students,
            'batches' => $batches,
            'enrollments' => $enrollments,
        ]);
    }

    public function store(StoreFeeStatusRequest $request)
    {
        FeeStatus::create([
            'student_id' => $request->student_id,
            'batch_id' => $request->batch_id,
            'amount_paid' => $request->amount_paid,
            'amount_due' => $request->amount_due ?? 0,
            'due_date' => $request->due_date ?: null,
            'status' => $request->status,
            'payment_date' => $request->payment_date ?: null,
            'notes' => $request->notes ?: null,
        ]);

        return to_route('fees.index')->with('toast', ['type' => 'success', 'message' => 'Fee status created successfully.']);
    }

    public function edit(FeeStatus $fee): Response
    {
        $fee->load(['student', 'batch']);
        $students = Student::orderBy('name')->get();
        $batches = Batch::orderBy('name')->get();
        $enrollments = \App\Models\Enrollment::where('status', 'active')->with('student', 'batch')->get();

        return Inertia::render('fees/edit', [
            'fee' => $fee,
            'students' => $students,
            'batches' => $batches,
            'enrollments' => $enrollments,
        ]);
    }

    public function update(UpdateFeeStatusRequest $request, FeeStatus $fee)
    {
        $fee->update([
            'student_id' => $request->student_id,
            'batch_id' => $request->batch_id,
            'amount_paid' => $request->amount_paid,
            'amount_due' => $request->amount_due ?? 0,
            'due_date' => $request->due_date ?: null,
            'status' => $request->status,
            'payment_date' => $request->payment_date ?: null,
            'notes' => $request->notes ?: null,
        ]);

        return to_route('fees.index')->with('toast', ['type' => 'success', 'message' => 'Fee status updated successfully.']);
    }

    public function destroy(FeeStatus $fee)
    {
        $fee->delete();

        return to_route('fees.index')->with('toast', ['type' => 'success', 'message' => 'Fee status deleted successfully.']);
    }
}
