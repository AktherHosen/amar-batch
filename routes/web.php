<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\UserSettingsController;
use App\Http\Controllers\SuperAdmin\SuperAdminController;
use App\Http\Controllers\SuperAdmin\TenantController;
use App\Http\Controllers\SuperAdmin\PlanController;
use App\Http\Controllers\SuperAdmin\OwnerController;
use App\Http\Controllers\SuperAdmin\ContactMessageController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, 'index'])->name('home');

Route::get('/up', fn () => response()->json(['status' => 'ok']))->name('health');

Route::get('/docs', [PageController::class, 'docs'])->name('docs');
Route::get('/contact', [PageController::class, 'contact'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');
Route::get('/terms', [PageController::class, 'terms'])->name('terms');
Route::get('/privacy', [PageController::class, 'privacy'])->name('privacy');

// Onboarding routes (auth required, no tenant required)
Route::middleware(['auth', 'verified', 'onboarding'])->group(function () {
    require __DIR__.'/onboarding.php';
});

// Tenant routes (tenant required)
Route::middleware(['auth', 'verified', 'onboarding', 'tenant', 'role.permission', 'teacher.approved'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('user/settings', [UserSettingsController::class, 'get'])->name('user.settings.get');
    Route::post('user/settings', [UserSettingsController::class, 'update'])->name('user.settings.update');
});

Route::middleware(['auth', 'verified', 'onboarding', 'tenant', 'role.permission', 'teacher.approved'])->group(function () {
    require __DIR__.'/students.php';
    require __DIR__.'/batches.php';
    require __DIR__.'/teachers.php';
    require __DIR__.'/users.php';
    require __DIR__.'/fees.php';
    require __DIR__.'/attendance.php';
    require __DIR__.'/classes.php';
    require __DIR__.'/exams.php';
    require __DIR__.'/notifications.php';
    require __DIR__.'/notices.php';
    require __DIR__.'/holidays.php';
    require __DIR__.'/reports.php';
    require __DIR__.'/branches.php';
    require __DIR__.'/api-tokens.php';
    require __DIR__.'/subscription.php';
    require __DIR__.'/tenant-settings.php';
    require __DIR__.'/roles.php';
});

// Super admin routes (inside tenant middleware, super_admin role check)
Route::middleware(['auth', 'verified', 'tenant', 'role:super_admin'])->prefix('dashboard')->name('super-admin.')->group(function () {
    Route::get('sa/overview', [SuperAdminController::class, 'dashboard'])->name('dashboard');
    Route::resource('sa/tenants', TenantController::class)->only(['index', 'show']);
    Route::post('sa/tenants/{tenant}/toggle-active', [TenantController::class, 'toggleActive'])->name('tenants.toggle-active');
    Route::get('sa/tenants/{tenant}/detail', [SuperAdminController::class, 'showTenant'])->name('tenants.detail');
    Route::resource('sa/plans', PlanController::class)->except(['show']);
    Route::get('sa/payments', [SuperAdminController::class, 'payments'])->name('payments');
    Route::post('sa/payments/{payment}/approve', [SuperAdminController::class, 'approvePayment'])->name('payments.approve');
    Route::post('sa/payments/{payment}/cancel', [SuperAdminController::class, 'cancelPayment'])->name('payments.cancel');
    Route::get('sa/contacts', [ContactMessageController::class, 'index'])->name('contacts.index');
    Route::post('sa/contacts/{contactMessage}/reply', [ContactMessageController::class, 'reply'])->name('contacts.reply');
    Route::post('sa/contacts/{contactMessage}/read', [ContactMessageController::class, 'markRead'])->name('contacts.read');
    Route::get('sa/owners', [OwnerController::class, 'index'])->name('owners.index');
    Route::get('sa/owners/{owner}', [OwnerController::class, 'show'])->name('owners.show');
    Route::post('sa/owners/{owner}/toggle-active', [OwnerController::class, 'toggleActive'])->name('owners.toggle-active');
    Route::post('sa/owners/{owner}/assign-plan', [OwnerController::class, 'assignPlan'])->name('owners.assign-plan');
});

require __DIR__.'/settings.php';

// Payment routes: history/initiate need auth; gateway callbacks
// (success/failure/cancel/ipn) are server- or session-less requests
// from SSLCommerz and must stay outside the auth/tenant middleware.
Route::middleware(['auth', 'verified', 'onboarding'])->group(function () {
    Route::get('payment/history', [PaymentController::class, 'history'])->name('payment.history');
    Route::match(['get', 'post'], 'payment/initiate/{plan}', [PaymentController::class, 'initiate'])->name('payment.initiate');
});

Route::match(['get', 'post'], 'payment/success', [PaymentController::class, 'success'])->name('sslc.success');
Route::match(['get', 'post'], 'payment/failure', [PaymentController::class, 'failure'])->name('sslc.failure');
Route::match(['get', 'post'], 'payment/cancel', [PaymentController::class, 'cancel'])->name('sslc.cancel');
Route::post('payment/ipn', [PaymentController::class, 'ipn'])->name('sslc.ipn');
