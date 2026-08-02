---
name: phase-6-fee-tracking
description: Phase 6 — Build fee tracking: admin-only payment management, teacher read-only view, student own fee view. Run after Phase 5.
---

# Phase 6: Fee Tracking

## Goal

Track fee payments with admin-only write access, teachers see their batch fees, students see own fees.

## Prerequisites

- Phase 5 complete (Enrollment with auto-fee generation)

## Step 6.1: FeeController with RBAC

Create `app/Http/Controllers/FeeController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\FeeStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeeController extends Controller
{
    public function index(Request $request): Response
    {
        $query = FeeStatus::with(['student', 'batch']);

        // Teachers see only fees for their batches
        if ($request->user()->isTeacher()) {
            $batchIds = $request->user()->assignedBatches()->pluck('batches.id');
            $query->whereIn('batch_id', $batchIds);
        }

        // Students see only their own fees
        if ($request->user()->isStudent()) {
            $query->where('student_id', $request->user()->student_id);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $feeStatuses = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('fees/index', [
            'feeStatuses' => $feeStatuses,
            'filters' => $request->only(['status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        // Only admin can record payments
        $this->authorize('admin');

        $validated = $request->validate([
            'fee_status_id' => 'required|exists:fee_statuses,id',
            'amount' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string',
        ]);

        $feeStatus = FeeStatus::findOrFail($validated['fee_status_id']);
        $newAmountPaid = $feeStatus->amount_paid + $validated['amount'];

        $feeStatus->update([
            'amount_paid' => $newAmountPaid,
            'status' => $newAmountPaid >= $feeStatus->amount_due ? 'paid' : 'partial',
            'payment_date' => now(),
            'notes' => $validated['notes'] ?? $feeStatus->notes,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Payment recorded successfully.']);

        return back();
    }

    public function show(FeeStatus $feeStatus): Response
    {
        $this->authorize('view', $feeStatus);

        $feeStatus->load(['student', 'batch']);

        return Inertia::render('fees/show', [
            'feeStatus' => $feeStatus,
        ]);
    }
}
```

## Step 6.2: Fee Collection Page (Admin Only)

Create `resources/js/pages/fees/index.tsx`:

- Admin: full table with payment actions
- Teacher: read-only view of their batch fees
- Student: read-only view of own fees
- Filter tabs: All / Unpaid / Partial / Paid
- Summary cards: Total Due, Total Collected, Pending Count

## Step 6.3: Payment Modal (Admin Only)

Create `resources/js/components/payment-modal.tsx`:
- Only rendered for admin role
- Input for payment amount + notes
- Submits to FeeController.store

## Step 6.4: Fee Receipt Component

Create `resources/js/components/fee-receipt.tsx`:
- Print-friendly layout
- Uses window.print()

## Step 6.5: Routes

Create `routes/fees.php`:

```php
<?php

use App\Http\Controllers\FeeController;
use Illuminate\Support\Facades\Route;

Route::resource('fees', FeeController::class)->only(['index', 'show', 'store']);
```

Register in `routes/web.php`.

## After Completion

Run:
```bash
php artisan wayfinder:generate --with-form
npm run build
```

Then say: **"Load the phase-7-attendance skill"**
