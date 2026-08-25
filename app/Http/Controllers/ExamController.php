<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExamRequest;
use App\Http\Requests\UpdateExamRequest;
use App\Models\Batch;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Exam::class);

        $query = Exam::with('batch');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        if ($batchId = $request->input('batch_id')) {
            $query->where('batch_id', $batchId);
        }

        $exams = $query->latest('date')->paginate(10)->withQueryString();
        $batches = Batch::where('tenant_id', $request->user()->tenant_id)->where('status', 'active')->orderBy('name')->get();

        return Inertia::render('exams/index', [
            'exams' => $exams,
            'batches' => $batches,
            'filters' => $request->only(['search', 'batch_id']),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Exam::class);

        $batches = Batch::where('tenant_id', $request->user()->tenant_id)->where('status', 'active')->orderBy('name')->get();

        return Inertia::render('exams/create', [
            'batches' => $batches,
        ]);
    }

    public function store(StoreExamRequest $request): RedirectResponse
    {
        $this->authorize('create', Exam::class);

        Exam::create($request->validated());

        return to_route('exams.index')->with('toast', ['type' => 'success', 'message' => 'Exam created successfully.']);
    }

    public function show(Exam $exam): Response
    {
        $this->authorize('view', $exam);

        $exam->load(['batch', 'results.student']);

        $enrolledStudentIds = [];
        if ($exam->batch_id) {
            $enrolledStudentIds = \App\Models\Enrollment::where('batch_id', $exam->batch_id)
                ->where('status', 'active')
                ->pluck('student_id')
                ->toArray();
        }

        $query = Student::where('tenant_id', $exam->tenant_id)
            ->where('status', 'active')
            ->orderBy('name');

        if (count($enrolledStudentIds) > 0) {
            $query->whereIn('id', $enrolledStudentIds);
        }

        $students = $query->get();

        return Inertia::render('exams/show', [
            'exam' => $exam,
            'students' => $students,
            'enrolledStudentIds' => $enrolledStudentIds,
        ]);
    }

    public function edit(Exam $exam): Response
    {
        $this->authorize('update', $exam);

        $batches = Batch::where('tenant_id', $exam->tenant_id)->where('status', 'active')->orderBy('name')->get();

        return Inertia::render('exams/edit', [
            'exam' => $exam,
            'batches' => $batches,
        ]);
    }

    public function update(UpdateExamRequest $request, Exam $exam): RedirectResponse
    {
        $this->authorize('update', $exam);

        $exam->update($request->validated());

        return to_route('exams.show', $exam)->with('toast', ['type' => 'success', 'message' => 'Exam updated successfully.']);
    }

    public function destroy(Exam $exam): RedirectResponse
    {
        $this->authorize('delete', $exam);

        $exam->delete();

        return to_route('exams.index')->with('toast', ['type' => 'success', 'message' => 'Exam deleted successfully.']);
    }

    public function import(Request $request): RedirectResponse
    {
        $this->authorize('create', Exam::class);

        $rows = $request->input('rows', []);
        $imported = 0;
        $skipped = 0;

        foreach ($rows as $row) {
            try {
                Exam::create([
                    'title' => $row['title'] ?? '',
                    'subject' => $row['subject'] ?? null,
                    'batch_id' => $row['batch_id'] ?? null,
                    'date' => $row['date'] ?? null,
                    'total_marks' => $row['total_marks'] ?? 0,
                    'passing_marks' => $row['passing_marks'] ?? 0,
                    'notes' => $row['notes'] ?? null,
                ]);
                $imported++;
            } catch (\Illuminate\Database\QueryException $e) {
                $skipped++;
            }
        }

        $message = $imported . ' exams imported successfully.';
        if ($skipped > 0) {
            $message .= " {$skipped} skipped (duplicate or invalid).";
        }

        return to_route('exams.index')->with('toast', ['type' => 'success', 'message' => $message]);
    }

    public function storeResults(Request $request, Exam $exam): RedirectResponse
    {
        $this->authorize('update', $exam);

        $validated = $request->validate([
            'results' => ['required', 'array'],
            'results.*.student_id' => ['required', 'integer', 'exists:students,id'],
            'results.*.marks_obtained' => ['required', 'integer', 'min:0', "lte:{$exam->total_marks}"],
            'results.*.notes' => ['nullable', 'string'],
        ]);

        foreach ($validated['results'] as $result) {
            ExamResult::updateOrCreate(
                ['exam_id' => $exam->id, 'student_id' => $result['student_id']],
                [
                    'tenant_id' => $exam->tenant_id,
                    'marks_obtained' => $result['marks_obtained'],
                    'notes' => $result['notes'] ?? null,
                ]
            );
        }

        return back()->with('toast', ['type' => 'success', 'message' => 'Exam results saved successfully.']);
    }
}
