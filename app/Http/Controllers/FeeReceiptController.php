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
        $receipts = FeeReceipt::with(['student', 'batch'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('student', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhere('receipt_number', 'like', "%{$search}%");
            })
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('fees/receipts/index', [
            'receipts' => $receipts,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'batch_id' => 'required|exists:batches,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2100',
            'amount_paid' => 'required|numeric|min:0',
            'amount_due' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $receipt = FeeReceipt::create([
            ...$validated,
            'receipt_number' => FeeReceipt::generateReceiptNumber(),
            'created_by' => $request->user()->id,
        ]);

        return redirect()->route('fees.receipts.show', $receipt->id)
            ->with('success', 'Receipt generated successfully');
    }

    public function show(FeeReceipt $receipt)
    {
        $receipt->load(['student', 'batch', 'creator']);

        return Inertia::render('fees/receipts/show', [
            'receipt' => $receipt,
        ]);
    }

    public function destroy(FeeReceipt $receipt)
    {
        $receipt->delete();

        return redirect()->route('fees.receipts.index')
            ->with('success', 'Receipt deleted successfully');
    }
}
