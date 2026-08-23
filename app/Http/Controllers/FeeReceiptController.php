<?php

namespace App\Http\Controllers;

use App\Models\FeeReceipt;
use App\Models\FeeStatus;
use App\Models\Student;
use App\Models\Batch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeeReceiptController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', FeeReceipt::class);

        $receipts = FeeReceipt::with(['student', 'batch'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('student', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhere('receipt_number', 'like', "%{$search}%");
            })
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        $students = \App\Models\Student::orderBy('name')->get(['id', 'name']);
        $batches = \App\Models\Batch::orderBy('name')->get(['id', 'name']);

        return Inertia::render('fees/receipts/index', [
            'receipts' => $receipts,
            'students' => $students,
            'batches' => $batches,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        $this->authorize('create', FeeReceipt::class);

        $students = Student::orderBy('name')->get(['id', 'name']);
        $batches = Batch::orderBy('name')->get(['id', 'name']);

        return Inertia::render('fees/receipts/create', [
            'students' => $students,
            'batches' => $batches,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', FeeReceipt::class);

        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'batch_id' => 'required|exists:batches,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2100',
            'amount_paid' => 'nullable|numeric|min:0',
            'amount_due' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $existing = FeeReceipt::where('student_id', $validated['student_id'])
            ->where('batch_id', $validated['batch_id'])
            ->where('month', $validated['month'])
            ->where('year', $validated['year'])
            ->first();

        if ($existing) {
            $existing->load(['student', 'batch', 'creator']);
            return redirect()->route('fees.receipts.show', $existing->id)
                ->with('toast', ['type' => 'info', 'message' => 'A receipt already exists for this period.']);
        }

        if (empty($validated['amount_due']) || $validated['amount_due'] <= 0) {
            $student = Student::with('coachingClass')->find($validated['student_id']);
            $validated['amount_due'] = $student?->coachingClass?->default_fee ?? 0;
        }

        if (empty($validated['amount_paid']) || $validated['amount_paid'] <= 0) {
            $feeStatus = FeeStatus::where('student_id', $validated['student_id'])
                ->where('batch_id', $validated['batch_id'])
                ->where('month', $validated['month'])
                ->where('year', $validated['year'])
                ->first();
            $validated['amount_paid'] = $feeStatus?->amount_paid ?? 0;
        }

        $receipt = FeeReceipt::create([
            ...$validated,
            'receipt_number' => FeeReceipt::generateReceiptNumber(),
            'created_by' => $request->user()->id,
        ]);

        return redirect()->route('fees.receipts.show', $receipt->id)
            ->with('toast', ['type' => 'success', 'message' => 'Receipt generated successfully.']);
    }

    public function show(FeeReceipt $receipt)
    {
        $this->authorize('view', $receipt);

        $receipt->load(['student', 'batch', 'creator']);

        return Inertia::render('fees/receipts/show', [
            'receipt' => $receipt,
        ]);
    }

    public function destroy(FeeReceipt $receipt)
    {
        $this->authorize('delete', $receipt);

        $receipt->delete();

        return redirect()->route('fees.receipts.index')
            ->with('toast', ['type' => 'success', 'message' => 'Receipt deleted successfully.']);
    }
}
