<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBatchRequest;
use App\Http\Requests\UpdateBatchRequest;
use App\Models\Batch;
use App\Models\BatchHistory;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\User;
use App\Policies\PlanLimitsPolicy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BatchController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Batch::class);

        $query = Batch::withCount('enrollments');

        if ($request->user()->isTeacher()) {
            $query->whereHas('teachers', fn ($q) => $q->where('users.id', $request->user()->id));
        }

        if ($request->user()->isStudent()) {
            $query->whereHas('enrollments', fn ($q) => $q->where('student_id', $request->user()->student_id));
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $batches = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('batches/index', [
            'batches' => $batches,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(Request $request): Response|RedirectResponse
    {
        $this->authorize('create', Batch::class);

        $planLimits = new PlanLimitsPolicy;
        if (! $planLimits->createBatch($request->user())) {
            return to_route('subscription.index')->with('toast', [
                'type' => 'warning',
                'message' => 'You have reached the batch limit for your current plan. Please upgrade to add more batches.',
            ]);
        }

        $remaining = $planLimits->remaining($request->user(), 'batches');
        $limit = $planLimits->getLimit($request->user(), 'batches');

        return Inertia::render('batches/create', [
            'planLimits' => [
                'can_create' => true,
                'remaining' => $remaining,
                'limit' => $limit,
            ],
        ]);
    }

    public function store(StoreBatchRequest $request): RedirectResponse
    {
        $this->authorize('create', Batch::class);

        $planLimits = new PlanLimitsPolicy;
        if (! $planLimits->createBatch($request->user())) {
            return to_route('subscription.index')->with('toast', [
                'type' => 'warning',
                'message' => 'You have reached the batch limit for your current plan. Please upgrade to add more batches.',
            ]);
        }

        Batch::create($request->validated());

        return to_route('batches.index')->with('toast', ['type' => 'success', 'message' => 'Batch created successfully.']);
    }

    public function show(Request $request, Batch $batch): Response
    {
        $this->authorize('view', $batch);

        $batch->load(['enrollments.student.coachingClass', 'teachers', 'history.student', 'history.user']);

        $tenantId = $request->user()->tenant_id;
        $teachers = User::where('role', 'teacher')->where('tenant_id', $tenantId)->get();
        $students = Student::with('coachingClass')->where('status', 'active')->where('tenant_id', $tenantId)->orderBy('name')->get();

        $enrolledStudentIds = Enrollment::where('status', 'active')
            ->where('batch_id', $batch->id)
            ->pluck('student_id')
            ->unique()
            ->toArray();

        return Inertia::render('batches/show', [
            'batch' => $batch,
            'teachers' => $teachers,
            'students' => $students,
            'enrolledStudentIds' => $enrolledStudentIds,
        ]);
    }

    public function edit(Batch $batch): Response
    {
        $this->authorize('update', $batch);

        return Inertia::render('batches/edit', [
            'batch' => $batch,
        ]);
    }

    public function update(UpdateBatchRequest $request, Batch $batch): RedirectResponse
    {
        $this->authorize('update', $batch);

        $batch->update($request->validated());

        return to_route('batches.show', $batch)->with('toast', ['type' => 'success', 'message' => 'Batch updated successfully.']);
    }

    public function destroy(Batch $batch): RedirectResponse
    {
        $this->authorize('delete', $batch);

        $batch->delete();

        return to_route('batches.index')->with('toast', ['type' => 'success', 'message' => 'Batch deleted successfully.']);
    }

    public function assignTeacher(Request $request, Batch $batch): RedirectResponse
    {
        $this->authorize('update', $batch);

        $tenantId = $request->user()->tenant_id;
        $request->validate([
            'teacher_id' => ['required', Rule::exists('users', 'id')->where('tenant_id', $tenantId)],
        ]);

        /** @var User $teacher */
        $teacher = User::where('tenant_id', $tenantId)->findOrFail($request->teacher_id);

        if ($teacher->role !== 'teacher') {
            abort(422, 'Selected user is not a teacher.');
        }

        $batch->teachers()->syncWithoutDetaching([
            $teacher->id => ['assigned_at' => now()],
        ]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Teacher assigned successfully.']);
    }

    public function removeTeacher(Request $request, Batch $batch): RedirectResponse
    {
        $this->authorize('update', $batch);

        $tenantId = $request->user()->tenant_id;
        $request->validate([
            'teacher_id' => ['required', Rule::exists('users', 'id')->where('tenant_id', $tenantId)],
        ]);

        $batch->teachers()->detach($request->teacher_id);

        return back()->with('toast', ['type' => 'success', 'message' => 'Teacher removed from batch.']);
    }

    public function complete(Batch $batch): RedirectResponse
    {
        $this->authorize('update', $batch);

        $batch->update(['status' => 'completed']);

        $activeEnrollments = $batch->enrollments()->where('status', 'active')->get();
        foreach ($activeEnrollments as $enrollment) {
            $enrollment->update(['status' => 'completed']);
            BatchHistory::create([
                'batch_id' => $batch->id,
                'student_id' => $enrollment->student_id,
                'action' => 'completed',
                'action_date' => now()->toDateString(),
                'user_id' => request()->user()->id,
                'notes' => 'Batch completed',
            ]);
        }

        return back()->with('toast', ['type' => 'success', 'message' => 'Batch completed successfully.']);
    }
}
