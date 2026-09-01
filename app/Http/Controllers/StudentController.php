<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\Attendance;
use App\Models\CoachingClass;
use App\Models\InAppNotification;
use App\Models\Student;
use App\Policies\PlanLimitsPolicy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Student::class);

        $query = Student::with('coachingClass')->withCount('parents');

        if ($request->user()->isTeacher()) {
            $studentIds = $request->user()->assignedBatches()
                ->join('enrollments', 'batches.id', '=', 'enrollments.batch_id')
                ->where('enrollments.status', 'active')
                ->pluck('enrollments.student_id')
                ->unique();
            $query->whereIn('students.id', $studentIds);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $students = $query->latest()->paginate(10)->withQueryString()
            ->through(fn ($s) => [
                ...$s->toArray(),
                'has_parent' => $s->parents()->exists(),
            ]);

        return Inertia::render('students/index', [
            'students' => $students,
            'coachingClasses' => CoachingClass::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(Request $request): Response|RedirectResponse
    {
        $this->authorize('create', Student::class);

        $planLimits = new PlanLimitsPolicy;
        if (! $planLimits->createStudent($request->user())) {
            return to_route('subscription.index')->with('toast', [
                'type' => 'warning',
                'message' => 'You have reached the student limit for your current plan. Please upgrade to add more students.',
            ]);
        }

        $remaining = $planLimits->remaining($request->user(), 'students');
        $limit = $planLimits->getLimit($request->user(), 'students');

        $coachingClasses = CoachingClass::where('tenant_id', app('tenant_id'))->orderBy('name')->get();

        return Inertia::render('students/create', [
            'coachingClasses' => $coachingClasses,
            'planLimits' => [
                'can_create' => true,
                'remaining' => $remaining,
                'limit' => $limit,
            ],
        ]);
    }

    public function store(StoreStudentRequest $request): RedirectResponse
    {
        $this->authorize('create', Student::class);

        $planLimits = new PlanLimitsPolicy;
        if (! $planLimits->createStudent($request->user())) {
            return to_route('subscription.index')->with('toast', [
                'type' => 'warning',
                'message' => 'You have reached the student limit for your current plan. Please upgrade to add more students.',
            ]);
        }

        $validated = $request->validated();

        if (empty($validated['joined_at'])) {
            $validated['joined_at'] = now()->toDateString();
        }

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('students', 'public');
        }

        $createParent = $validated['create_parent_login'] ?? false;
        $parentEmail = $validated['parent_email'] ?? null;
        $parentPassword = $validated['parent_password'] ?? null;

        unset($validated['create_parent_login'], $validated['parent_email'], $validated['parent_password']);

        $student = Student::create($validated);

        if ($createParent && $parentEmail && $parentPassword) {
            $tenantId = app('tenant_id');

            $parentUser = \App\Models\User::create([
                'name' => $validated['guardian_name'] ?? $student->name . "'s Parent",
                'email' => $parentEmail,
                'phone' => $validated['guardian_phone'] ?? null,
                'password' => bcrypt($parentPassword),
                'role' => 'parent',
                'is_approved' => true,
                'onboarding_complete' => true,
            ]);

            $parentUser->tenants()->attach($tenantId, ['role' => 'parent', 'is_approved' => true]);
            $student->parents()->attach($parentUser->id);
        }

        InAppNotification::create([
            'user_id' => $request->user()->id,
            'title' => 'New Student Added',
            'message' => "Student \"{$student->name}\" has been enrolled.",
            'type' => 'student',
            'action_url' => route('students.show', $student->id),
        ]);

        return to_route('students.index')->with('toast', ['type' => 'success', 'message' => 'Student created successfully.']);
    }

    public function show(Request $request, Student $student): Response
    {
        $this->authorize('view', $student);

        $student->load([
            'coachingClass',
            'enrollments' => fn ($q) => $q->with('batch')->latest(),
            'feeStatuses' => fn ($q) => $q->with('batch')->latest()->take(100),
            'examResults' => fn ($q) => $q->with('exam.batch')->latest()->take(100),
            'batchHistories' => fn ($q) => $q->with('batch', 'user')->latest()->take(100),
        ]);

        $student->loadCount('parents');

        $attendanceSummary = Attendance::where('student_id', $student->id)
            ->selectRaw('YEAR(date) as year, MONTH(date) as month, status, COUNT(*) as count')
            ->groupBy('year', 'month', 'status')
            ->get()
            ->groupBy('year')
            ->map(function ($yearGroup) {
                return $yearGroup->groupBy('month')
                    ->mapWithKeys(function ($monthGroup, $month) {
                        return [$month => $monthGroup->pluck('count', 'status')->toArray()];
                    });
            });

        return Inertia::render('students/show', [
            'student' => $student,
            'attendanceSummary' => $attendanceSummary,
            'coachingClasses' => CoachingClass::where('tenant_id', app('tenant_id'))->orderBy('name')->get(),
        ]);
    }

    public function edit(Request $request, Student $student): Response
    {
        $this->authorize('update', $student);

        $student->loadCount('parents');
        $coachingClasses = CoachingClass::where('tenant_id', app('tenant_id'))->orderBy('name')->get();

        return Inertia::render('students/edit', [
            'student' => $student,
            'coachingClasses' => $coachingClasses,
        ]);
    }

    public function update(UpdateStudentRequest $request, Student $student): RedirectResponse
    {
        $this->authorize('update', $student);

        $validated = $request->validated();
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($student->photo) {
                \Storage::disk('public')->delete($student->photo);
            }
            $validated['photo'] = $request->file('photo')->store('students', 'public');
        } else {
            unset($validated['photo']);
        }

        $createParent = $validated['create_parent_login'] ?? false;
        $parentEmail = $validated['parent_email'] ?? null;
        $parentPassword = $validated['parent_password'] ?? null;

        unset($validated['create_parent_login'], $validated['parent_email'], $validated['parent_password']);

        $student->update($validated);

        if (isset($validated['guardian_name']) || isset($validated['guardian_phone'])) {
            $linkedParent = $student->parents()->first();
            if ($linkedParent) {
                $linkedParent->update([
                    'name' => $validated['guardian_name'] ?? $linkedParent->name,
                    'phone' => $validated['guardian_phone'] ?? $linkedParent->phone,
                ]);
            }
        }

        if ($createParent && $parentEmail && $parentPassword && ! $student->parents()->exists()) {
            $tenantId = app('tenant_id');

            $parentUser = \App\Models\User::create([
                'name' => $validated['guardian_name'] ?? $student->name . "'s Parent",
                'email' => $parentEmail,
                'phone' => $validated['guardian_phone'] ?? null,
                'password' => bcrypt($parentPassword),
                'role' => 'parent',
                'is_approved' => true,
                'onboarding_complete' => true,
            ]);

            $parentUser->tenants()->attach($tenantId, ['role' => 'parent', 'is_approved' => true]);
            $student->parents()->attach($parentUser->id);
        }

        return to_route('students.show', $student)->with('toast', ['type' => 'success', 'message' => 'Student updated successfully.']);
    }

    public function destroy(Student $student): RedirectResponse
    {
        $this->authorize('delete', $student);

        $student->delete();

        return to_route('students.index')->with('toast', ['type' => 'success', 'message' => 'Student deleted successfully.']);
    }

    public function updateStatus(Request $request, Student $student): RedirectResponse
    {
        $this->authorize('update', $student);

        $status = $request->input('status');

        if (! in_array($status, ['active', 'inactive', 'paused'])) {
            abort(422);
        }

        // Check plan limit when reactivating a student
        if ($status === 'active' && $student->status !== 'active') {
            $planLimits = new PlanLimitsPolicy;
            if (! $planLimits->createStudent($request->user())) {
                return to_route('subscription.index')->with('toast', [
                    'type' => 'warning',
                    'message' => 'You have reached the student limit for your current plan. Please upgrade to reactivate this student.',
                ]);
            }
        }

        $updateData = ['status' => $status];

        if ($status === 'paused') {
            $updateData['paused_at'] = now();
            $updateData['left_at'] = null;
        } elseif ($status === 'active') {
            $updateData['paused_at'] = null;
            $updateData['left_at'] = null;
        } elseif ($status === 'inactive') {
            $updateData['paused_at'] = null;
            $updateData['left_at'] = now();
        }

        $student->update($updateData);

        $message = match ($status) {
            'paused' => 'Student paused successfully.',
            'active' => 'Student resumed successfully.',
            default => 'Student deactivated successfully.',
        };

        return back()->with('toast', [
            'type' => 'success',
            'message' => $message,
        ]);
    }

    public function updateCoachingClass(Request $request, Student $student): RedirectResponse
    {
        $this->authorize('update', $student);

        $validated = $request->validate([
            'coaching_class_id' => ['required', 'exists:coaching_classes,id'],
        ]);

        $student->update($validated);

        return back()->with('toast', ['type' => 'success', 'message' => 'Class updated successfully.']);
    }

    public function import(Request $request): RedirectResponse
    {
        $this->authorize('create', Student::class);

        $planLimits = new PlanLimitsPolicy;
        if (! $planLimits->createStudent($request->user())) {
            return to_route('subscription.index')->with('toast', [
                'type' => 'warning',
                'message' => 'You have reached the student limit for your current plan. Please upgrade to import more students.',
            ]);
        }

        $rows = $request->input('rows', []);
        $imported = 0;
        $skipped = 0;

        foreach ($rows as $row) {
            // Re-check limit before each student to respect exact cap
            if (! $planLimits->createStudent($request->user())) {
                $skipped += count($rows) - $imported - $skipped;
                break;
            }

            try {
                $coachingClassId = $row['coaching_class_id'] ?? null;

                if (! $coachingClassId && ! empty($row['coaching_class'])) {
                    $className = trim($row['coaching_class']);
                    $coachingClass = CoachingClass::firstOrCreate(
                        ['name' => $className, 'tenant_id' => app('tenant_id')],
                        ['default_fee' => 0]
                    );
                    $coachingClassId = $coachingClass->id;
                }

                $joinedAt = ! empty($row['joined_at']) ? $row['joined_at'] : now()->toDateString();

                Student::create([
                    'name' => $row['name'] ?? '',
                    'phone' => $row['phone'] ?? null,
                    'coaching_class_id' => $coachingClassId,
                    'section' => $row['section'] ?? null,
                    'guardian_name' => $row['guardian_name'] ?? null,
                    'guardian_phone' => $row['guardian_phone'] ?? null,
                    'status' => $row['status'] ?? 'active',
                    'joined_at' => $joinedAt,
                ]);
                $imported++;
            } catch (\Illuminate\Database\QueryException $e) {
                $skipped++;
            }
        }

        $message = $imported . ' students imported successfully.';
        if ($skipped > 0) {
            $message .= " {$skipped} skipped (plan limit reached or invalid).";
        }

        return to_route('students.index')->with('toast', ['type' => 'success', 'message' => $message]);
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', Student::class);

        $query = Student::with('coachingClass');

        if ($request->user()->isTeacher()) {
            $studentIds = $request->user()->assignedBatches()
                ->join('enrollments', 'batches.id', '=', 'enrollments.batch_id')
                ->where('enrollments.status', 'active')
                ->pluck('enrollments.student_id')
                ->unique();
            $query->whereIn('students.id', $studentIds);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $students = $query->latest()->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="students_' . date('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($students) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Name', 'Phone', 'Class', 'Section', 'Status', 'Guardian Name', 'Guardian Phone', 'Joined At']);

            foreach ($students as $student) {
                fputcsv($file, [
                    $student->id,
                    $student->name,
                    $student->phone,
                    $student->coachingClass->name ?? '',
                    $student->section,
                    $student->status,
                    $student->guardian_name,
                    $student->guardian_phone,
                    $student->joined_at,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
