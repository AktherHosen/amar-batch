<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\Plan;
use App\Models\PlanFeature;
use App\Models\Student;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'total_students' => Student::count(),
            'active_batches' => Batch::where('status', 'active')->count(),
            'total_enrollments' => Enrollment::where('status', 'active')->count(),
        ];

        $plans = Plan::where('is_active', true)
            ->orderBy('price_monthly')
            ->get(['id', 'name', 'slug', 'description', 'price_monthly', 'price_yearly', 'max_students', 'max_staff', 'max_batches', 'features', 'is_default']);

        $planFeatures = PlanFeature::orderBy('name')->get();
        $availableFeatures = $planFeatures->pluck('slug')->toArray();
        $featureMap = $planFeatures->pluck('name', 'slug')->toArray();

        return Inertia::render('welcome', [
            'stats' => $stats,
            'plans' => $plans,
            'availableFeatures' => $availableFeatures,
            'featureMap' => $featureMap,
        ]);
    }
}
