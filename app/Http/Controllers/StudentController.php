<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\CoachingClass;
use App\Models\Student;
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

        $students = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('students/index', [
            'students' => $students,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Student::class);

        $coachingClasses = CoachingClass::orderBy('name')->get();

        return Inertia::render('students/create', [
            'coachingClasses' => $coachingClasses,
        ]);
    }

    public function store(StoreStudentRequest $request): RedirectResponse
    {
        $this->authorize('create', Student::class);

        Student::create($request->validated());

        return to_route('students.index')->with('toast', ['type' => 'success', 'message' => 'Student created successfully.']);
    }

    public function show(Student $student): Response
    {
        $this->authorize('view', $student);

        $student->load(['coachingClass', 'enrollments.batch', 'feeStatuses.batch', 'attendances']);

        return Inertia::render('students/show', [
            'student' => $student,
        ]);
    }

    public function edit(Student $student): Response
    {
        $this->authorize('update', $student);

        $coachingClasses = CoachingClass::orderBy('name')->get();

        return Inertia::render('students/edit', [
            'student' => $student,
            'coachingClasses' => $coachingClasses,
        ]);
    }

    public function update(UpdateStudentRequest $request, Student $student): RedirectResponse
    {
        $this->authorize('update', $student);

        $student->update($request->validated());

        return to_route('students.show', $student)->with('toast', ['type' => 'success', 'message' => 'Student updated successfully.']);
    }

    public function destroy(Student $student): RedirectResponse
    {
        $this->authorize('delete', $student);

        $student->delete();

        return to_route('students.index')->with('toast', ['type' => 'success', 'message' => 'Student deleted successfully.']);
    }
}
