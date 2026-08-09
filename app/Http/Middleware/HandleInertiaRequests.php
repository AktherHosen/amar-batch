<?php

namespace App\Http\Middleware;

use App\Models\Batch;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $tenant = $user?->tenant;

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
            ],
            'tenant' => $tenant ? [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'logo' => $tenant->logo,
                'currency' => $tenant->currency,
                'timezone' => $tenant->timezone,
            ] : null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'appStats' => $tenant ? [
                'total_students' => Student::where('tenant_id', $tenant->id)->count(),
                'active_batches' => Batch::where('tenant_id', $tenant->id)->where('status', 'active')->count(),
                'attendance_rate' => 98,
                'fee_collection_rate' => 100,
            ] : [
                'total_students' => 0,
                'active_batches' => 0,
                'attendance_rate' => 0,
                'fee_collection_rate' => 0,
            ],
        ];
    }
}
