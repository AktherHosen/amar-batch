<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\Enrollment;
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

        return Inertia::render('welcome', [
            'stats' => $stats,
        ]);
    }
}
