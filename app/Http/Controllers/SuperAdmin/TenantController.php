<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Payment;
use App\Models\Student;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Tenant::withCount(['users', 'students', 'batches'])
            ->with('subscription.plan');

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
        $tenant->load('subscription.plan');

        $stats = [
            'total_users' => User::whereHas('tenants', fn ($q) => $q->where('tenants.id', $tenant->id))->count(),
            'total_students' => Student::where('tenant_id', $tenant->id)->count(),
            'active_students' => Student::where('tenant_id', $tenant->id)->where('status', 'active')->count(),
            'total_batches' => Batch::where('tenant_id', $tenant->id)->count(),
            'active_batches' => Batch::where('tenant_id', $tenant->id)->where('status', 'active')->count(),
            'total_payments' => Payment::where('tenant_id', $tenant->id)->count(),
            'successful_payments' => Payment::where('tenant_id', $tenant->id)->where('status', 'success')->count(),
            'total_spent' => (float) Payment::where('tenant_id', $tenant->id)->where('status', 'success')->sum('amount'),
            'total_enrollments' => \App\Models\Enrollment::where('tenant_id', $tenant->id)->count(),
        ];

        $recentPayments = Payment::where('tenant_id', $tenant->id)
            ->with('plan')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('super-admin/tenants/show', [
            'tenant' => $tenant,
            'stats' => $stats,
            'recentPayments' => $recentPayments,
        ]);
    }

    public function toggleActive(Tenant $tenant): RedirectResponse
    {
        $tenant->update(['is_active' => ! $tenant->is_active]);

        $owner = $tenant->users()->where('role', 'owner')->first();
        if ($owner) {
            $owner->update(['role' => $tenant->is_active ? 'owner' : 'inactive']);
        }

        $status = $tenant->is_active ? 'activated' : 'deactivated';

        return back()->with('toast', ['type' => 'success', 'message' => "Tenant {$status} successfully."]);
    }
}
