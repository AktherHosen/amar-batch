<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Student;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminController extends Controller
{
    public function dashboard(): Response
    {
        $stats = [
            'total_tenants' => Tenant::count(),
            'active_tenants' => Tenant::where('is_active', true)->count(),
            'total_users' => User::count(),
            'total_students' => Student::count(),
            'total_batches' => Batch::count(),
            'active_batches' => Batch::where('status', 'active')->count(),
        ];

        $recentTenants = Tenant::latest()->take(10)->get();

        $tenantStats = Tenant::withCount(['users', 'students', 'batches'])
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('super-admin/dashboard', [
            'stats' => $stats,
            'recentTenants' => $recentTenants,
            'tenantStats' => $tenantStats,
        ]);
    }
}
