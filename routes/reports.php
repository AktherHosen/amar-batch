<?php

use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['plan.feature:reports'])->group(function () {
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/branches', [ReportController::class, 'branchComparison'])->name('reports.branches');
    Route::get('reports/unpaid-students', [ReportController::class, 'unpaidStudents'])->name('reports.unpaid-students');
});
