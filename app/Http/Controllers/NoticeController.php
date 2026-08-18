<?php

namespace App\Http\Controllers;

use App\Models\Notice;
use App\Models\Batch;
use App\Models\InAppNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NoticeController extends Controller
{
    public function index(Request $request)
    {
        $notices = Notice::with(['batch', 'creator'])
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            })
            ->when($request->batch_id, function ($query, $batchId) {
                $query->where('batch_id', $batchId)->orWhereNull('batch_id');
            })
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        $batches = Batch::where('status', '!=', 'completed')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('notices/index', [
            'notices' => $notices,
            'batches' => $batches,
            'filters' => $request->only(['search', 'batch_id']),
        ]);
    }

    public function create()
    {
        $batches = Batch::where('status', '!=', 'completed')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('notices/create', [
            'batches' => $batches,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'batch_id' => 'nullable|exists:batches,id',
            'is_active' => 'boolean',
        ]);

        $validated['tenant_id'] = $request->user()->tenant_id;
        $validated['created_by'] = $request->user()->id;
        $validated['published_at'] = $validated['is_active'] ? now() : null;

        Notice::create($validated);

        InAppNotification::create([
            'user_id' => $request->user()->id,
            'title' => 'Notice Posted',
            'message' => "\"{$request->title}\" has been published.",
            'type' => 'notice',
            'action_url' => route('notices.index'),
        ]);

        return redirect()->route('notices.index')
            ->with('success', 'Notice created successfully');
    }

    public function show(Notice $notice)
    {
        $notice->load(['batch', 'creator']);

        return Inertia::render('notices/show', [
            'notice' => $notice,
        ]);
    }

    public function edit(Notice $notice)
    {
        $batches = Batch::where('status', '!=', 'completed')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('notices/edit', [
            'notice' => $notice,
            'batches' => $batches,
        ]);
    }

    public function update(Request $request, Notice $notice)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'batch_id' => 'nullable|exists:batches,id',
            'is_active' => 'boolean',
        ]);

        $validated['published_at'] = $validated['is_active'] && !$notice->published_at
            ? now()
            : $notice->published_at;

        $notice->update($validated);

        return redirect()->route('notices.index')
            ->with('success', 'Notice updated successfully');
    }

    public function destroy(Notice $notice)
    {
        $notice->delete();

        return redirect()->route('notices.index')
            ->with('success', 'Notice deleted successfully');
    }

    public function import(Request $request)
    {
        $rows = $request->input('rows', []);

        foreach ($rows as $row) {
            $data = [
                'title' => $row['title'] ?? '',
                'content' => $row['content'] ?? '',
                'batch_id' => $row['batch_id'] ?? null,
                'is_active' => $row['is_active'] ?? true,
                'tenant_id' => $request->user()->tenant_id,
                'created_by' => $request->user()->id,
                'published_at' => ($row['is_active'] ?? true) ? now() : null,
            ];

            Notice::create($data);
        }

        return redirect()->route('notices.index')
            ->with('success', count($rows) . ' notices imported successfully');
    }
}
