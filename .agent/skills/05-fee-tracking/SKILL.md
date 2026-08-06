---
name: phase-6-fee-tracking
description: Phase 6 — Build monthly fee tracking: admin-only payment management, teacher read-only view. Uses month/year instead of amount_due/status/due_date. Run after Phase 5.
---

# Phase 6: Fee Tracking (Monthly)

## Goal

Track fee payments monthly with admin-only write access, teachers see their batch fees.

## Prerequisites

- Phase 5 complete (Enrollment)

## Schema

Fee statuses use monthly tracking:
- `student_id`, `batch_id` — who and where
- `month` (1-12), `year` (e.g. 2026) — which month
- `amount_paid` — how much paid
- `notes` — optional notes
- Unique constraint: `student_id + batch_id + month + year`

The coaching class's `default_fee` determines the expected amount. `amount_paid` vs `default_fee` determines payment status.

## Step 6.1: FeeStatusController with RBAC

Create `app/Http/Controllers/FeeStatusController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\FeeStatus;
use App\Models\CoachingClass;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeeStatusController extends Controller
{
    public function index(Request $request): Response
    {
        $query = FeeStatus::with(['student.coachingClass', 'batch']);

        // Teachers see only fees for their batches
        if ($request->user()->isTeacher()) {
            $batchIds = $request->user()->assignedBatches()->pluck('batches.id');
            $query->whereIn('batch_id', $batchIds);
        }

        if ($status = $request->input('status')) {
            if ($status === 'paid') {
                $query->whereRaw('amount_paid >= (SELECT default_fee FROM coaching_classes WHERE coaching_classes.id = students.coaching_class_id)');
            } elseif ($status === 'unpaid') {
                $query->where('amount_paid', 0);
            } elseif ($status === 'partial') {
                $query->whereRaw('amount_paid > 0 AND amount_paid < (SELECT default_fee FROM coaching_classes WHERE coaching_classes.id = students.coaching_class_id)');
            }
        }

        if ($month = $request->input('month')) {
            $query->where('month', $month);
        }

        if ($year = $request->input('year')) {
            $query->where('year', $year);
        }

        $feeStatuses = $query->latest('year')->latest('month')->paginate(15)->withQueryString();

        return Inertia::render('fees/index', [
            'feeStatuses' => $feeStatuses,
            'filters' => $request->only(['status', 'month', 'year']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'batch_id' => 'required|exists:batches,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2100',
            'amount_paid' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $existing = FeeStatus::where('student_id', $validated['student_id'])
            ->where('batch_id', $validated['batch_id'])
            ->where('month', $validated['month'])
            ->where('year', $validated['year'])
            ->first();

        if ($existing) {
            $existing->update($validated);
        } else {
            FeeStatus::create($validated);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Fee status updated successfully.']);

        return back();
    }

    public function show(FeeStatus $feeStatus): Response
    {
        $this->authorize('view', $feeStatus);

        $feeStatus->load(['student.coachingClass', 'batch']);

        return Inertia::render('fees/show', [
            'feeStatus' => $feeStatus,
        ]);
    }
}
```

## Step 6.2: Fee Collection Page

Create `resources/js/pages/fees/index.tsx`:

- Admin: full table with payment actions
- Teacher: read-only view of their batch fees
- Filter tabs: All / Unpaid / Partial / Paid
- Filter by month/year
- Summary cards: Total Collected, Total Records
- Excel/CSV export functionality

## Step 6.3: Payment Modal (Admin Only)

Create `resources/js/components/payment-modal.tsx`:
- Only rendered for admin role
- Input for amount_paid, month, year, notes
- Submits to FeeStatusController.store

## Step 6.4: Routes

Create `routes/fees.php`:

```php
<?php

use App\Http\Controllers\FeeStatusController;
use Illuminate\Support\Facades\Route;

Route::resource('fees', FeeStatusController::class)->only(['index', 'show', 'store']);
```

Register in `routes/web.php`.

## After Completion

Run:
```bash
php artisan wayfinder:generate --with-form
npm run build
```

Then say: **"Load the phase-7-attendance skill"**
