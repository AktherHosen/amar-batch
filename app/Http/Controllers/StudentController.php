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

        $students = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('students/index', [
            'students' => $students,
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

        $coachingClasses = CoachingClass::where('tenant_id', $request->user()->tenant_id)->orderBy('name')->get();

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
        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('students', 'public');
        }

        $student = Student::create($validated);

        InAppNotification::create([
            'user_id' => $request->user()->id,
            'title' => 'New Student Added',
            'message' => "Student \"{$student->name}\" has been enrolled.",
            'type' => 'student',
            'action_url' => route('students.show', $student->id),
        ]);

        return to_route('students.index')->with('toast', ['type' => 'success', 'message' => 'Student created successfully.']);
    }

    public function show(Student $student): Response
    {
        $this->authorize('view', $student);

        $student->load(['coachingClass', 'enrollments.batch', 'feeStatuses.batch']);

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
        ]);
    }

    public function edit(Request $request, Student $student): Response
    {
        $this->authorize('update', $student);

        $coachingClasses = CoachingClass::where('tenant_id', $request->user()->tenant_id)->orderBy('name')->get();

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
        }

        $student->update($validated);

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

        if (! in_array($status, ['active', 'inactive'])) {
            abort(422);
        }

        $student->update([
            'status' => $status,
            'left_at' => $status === 'inactive' ? now() : null,
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => $status === 'active'
                ? 'Student activated successfully.'
                : 'Student deactivated successfully.',
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        $this->authorize('create', Student::class);

        $rows = $request->input('rows', []);

        foreach ($rows as $row) {
            Student::create([
                'name' => $row['name'] ?? '',
                'phone' => $row['phone'] ?? null,
                'coaching_class_id' => $row['coaching_class_id'] ?? null,
                'section' => $row['section'] ?? null,
                'guardian_name' => $row['guardian_name'] ?? null,
                'guardian_phone' => $row['guardian_phone'] ?? null,
                'status' => $row['status'] ?? 'active',
            ]);
        }

        return to_route('students.index')->with('toast', ['type' => 'success', 'message' => count($rows) . ' students imported successfully.']);
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
