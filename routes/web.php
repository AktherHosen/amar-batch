<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, 'index'])->name('home');

Route::get('/docs', [PageController::class, 'docs'])->name('docs');
Route::get('/contact', [PageController::class, 'contact'])->name('contact');
Route::get('/terms', [PageController::class, 'terms'])->name('terms');
Route::get('/privacy', [PageController::class, 'privacy'])->name('privacy');

// Super admin routes (no tenant required)
require __DIR__.'/super-admin.php';

// Onboarding routes (auth required, no tenant required)
Route::middleware(['auth', 'verified', 'onboarding'])->group(function () {
    require __DIR__.'/onboarding.php';
});

// Tenant routes (tenant required)
Route::middleware(['auth', 'verified', 'onboarding', 'tenant', 'teacher.approved'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
});

Route::middleware(['auth', 'verified', 'onboarding', 'tenant', 'teacher.approved'])->group(function () {
    require __DIR__.'/students.php';
    require __DIR__.'/batches.php';
    require __DIR__.'/teachers.php';
    require __DIR__.'/fees.php';
    require __DIR__.'/attendance.php';
    require __DIR__.'/classes.php';
    require __DIR__.'/exams.php';
    require __DIR__.'/notifications.php';
    require __DIR__.'/reports.php';
    require __DIR__.'/branches.php';
    require __DIR__.'/api-tokens.php';
    require __DIR__.'/subscription.php';
    require __DIR__.'/payment.php';
    require __DIR__.'/tenant-settings.php';
});

require __DIR__.'/settings.php';
