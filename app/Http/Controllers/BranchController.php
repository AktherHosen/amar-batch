<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBranchRequest;
use App\Http\Requests\UpdateBranchRequest;
use App\Models\Branch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BranchController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Branch::class);

        $query = Branch::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $branches = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('branches/index', [
            'branches' => $branches,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Branch::class);

        return Inertia::render('branches/create');
    }

    public function store(StoreBranchRequest $request): RedirectResponse
    {
        $this->authorize('create', Branch::class);

        Branch::create($request->validated());

        return to_route('branches.index')->with('toast', ['type' => 'success', 'message' => 'Branch created successfully.']);
    }

    public function show(Branch $branch): Response
    {
        $this->authorize('view', $branch);

        $branch->loadCount(['batches', 'students']);

        return Inertia::render('branches/show', [
            'branch' => $branch,
        ]);
    }

    public function edit(Branch $branch): Response
    {
        $this->authorize('update', $branch);

        return Inertia::render('branches/edit', [
            'branch' => $branch,
        ]);
    }

    public function update(UpdateBranchRequest $request, Branch $branch): RedirectResponse
    {
        $this->authorize('update', $branch);

        $branch->update($request->validated());

        return to_route('branches.show', $branch)->with('toast', ['type' => 'success', 'message' => 'Branch updated successfully.']);
    }

    public function destroy(Branch $branch): RedirectResponse
    {
        $this->authorize('delete', $branch);

        $branch->delete();

        return to_route('branches.index')->with('toast', ['type' => 'success', 'message' => 'Branch deleted successfully.']);
    }

    public function import(Request $request): RedirectResponse
    {
        $this->authorize('create', Branch::class);

        $rows = $request->input('rows', []);

        foreach ($rows as $row) {
            Branch::create([
                'name' => $row['name'] ?? '',
                'code' => $row['code'] ?? null,
                'address' => $row['address'] ?? null,
                'phone' => $row['phone'] ?? null,
                'email' => $row['email'] ?? null,
            ]);
        }

        return to_route('branches.index')->with('toast', ['type' => 'success', 'message' => count($rows) . ' branches imported successfully.']);
    }
}
