<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Tenant::withCount(['users', 'students', 'batches']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('is_active', $status === 'active');
        }

        $tenants = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('super-admin/tenants/index', [
            'tenants' => $tenants,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(Tenant $tenant): Response
    {
        $tenant->loadCount(['users', 'students', 'batches']);
        $tenant->load(['subscription.plan', 'users' => function ($q) {
            $q->latest()->take(10);
        }]);

        $recentStudents = $tenant->students()->latest()->take(10)->get();
        $recentBatches = $tenant->batches()->latest()->take(10)->get();

        return Inertia::render('super-admin/tenants/show', [
            'tenant' => $tenant,
            'recentStudents' => $recentStudents,
            'recentBatches' => $recentBatches,
        ]);
    }

    public function toggleActive(Tenant $tenant): RedirectResponse
    {
        $tenant->update(['is_active' => ! $tenant->is_active]);

        $status = $tenant->is_active ? 'activated' : 'deactivated';

        return back()->with('toast', ['type' => 'success', 'message' => "Tenant {$status} successfully."]);
    }
}
