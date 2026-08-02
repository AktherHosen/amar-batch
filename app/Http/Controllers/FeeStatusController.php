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

        return Inertia::render('fees/create', [
            'students' => $students,
            'batches' => $batches,
        ]);
    }

    public function store(StoreFeeStatusRequest $request)
    {
        FeeStatus::create($request->validated());

        return to_route('fees.index')->with('toast', ['type' => 'success', 'message' => 'Fee status created successfully.']);
    }

    public function edit(FeeStatus $fee): Response
    {
        $fee->load(['student', 'batch']);
        $students = Student::orderBy('name')->get();
        $batches = Batch::orderBy('name')->get();

        return Inertia::render('fees/edit', [
            'fee' => $fee,
            'students' => $students,
            'batches' => $batches,
        ]);
    }

    public function update(UpdateFeeStatusRequest $request, FeeStatus $fee)
    {
        $fee->update($request->validated());

        return to_route('fees.index')->with('toast', ['type' => 'success', 'message' => 'Fee status updated successfully.']);
    }

    public function destroy(FeeStatus $fee)
    {
        $fee->delete();

        return to_route('fees.index')->with('toast', ['type' => 'success', 'message' => 'Fee status deleted successfully.']);
    }
}
