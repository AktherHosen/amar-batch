<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, 'index'])->name('home');

// Super admin routes (no tenant required)
require __DIR__.'/super-admin.php';

// Tenant routes (tenant required)
Route::middleware(['auth', 'verified', 'tenant', 'teacher.approved'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
});

Route::middleware(['auth', 'verified', 'tenant', 'teacher.approved'])->group(function () {
    require __DIR__.'/students.php';
    require __DIR__.'/batches.php';
    require __DIR__.'/teachers.php';
    require __DIR__.'/fees.php';
    require __DIR__.'/attendance.php';
    require __DIR__.'/classes.php';
});

require __DIR__.'/settings.php';
