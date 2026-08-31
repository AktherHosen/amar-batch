<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\UserSettingsController;
use App\Http\Controllers\TenantSwitchController;
use App\Http\Controllers\SuperAdmin\SuperAdminController;
use App\Http\Controllers\SuperAdmin\TenantController;
use App\Http\Controllers\SuperAdmin\PlanController;
use App\Http\Controllers\SuperAdmin\OwnerController;
use App\Http\Controllers\SuperAdmin\ContactMessageController;
use App\Http\Controllers\SuperAdmin\PlanFeatureController;
use App\Http\Controllers\SuperAdmin\PaymentSettingController;
use App\Http\Controllers\ParentController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, 'index'])->name('home');

Route::get('/up', fn () => response()->json(['status' => 'ok']))->name('health');

Route::get('/docs', [PageController::class, 'docs'])->name('docs');
Route::get('/contact', [PageController::class, 'contact'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');
Route::get('/terms', [PageController::class, 'terms'])->name('terms');
Route::get('/privacy', [PageController::class, 'privacy'])->name('privacy');

// Tenant switching (auth required, no tenant required)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('select-tenant', [TenantSwitchController::class, 'show'])->name('select-tenant');
    Route::post('switch-tenant/{tenant}', [TenantSwitchController::class, 'switch'])->name('switch-tenant');
});

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

Route::middleware(['auth', 'verified', 'onboarding', 'tenant', 'block.superadmin', 'role.permission', 'teacher.approved'])->group(function () {
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
    require __DIR__.'/sms.php';
});

// Super admin routes (inside tenant middleware, super_admin role check)
Route::middleware(['auth', 'verified', 'tenant', 'role:super_admin'])->prefix('dashboard')->name('super-admin.')->group(function () {
    Route::get('overview', [SuperAdminController::class, 'dashboard'])->name('dashboard');
    Route::get('tenants/{tenant}/detail', [SuperAdminController::class, 'showTenant'])->name('tenants.detail');
    Route::post('tenants/{tenant}/toggle-active', [TenantController::class, 'toggleActive'])->name('tenants.toggle-active');
    Route::resource('plans', PlanController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::get('plan-features', [PlanFeatureController::class, 'index'])->name('plan-features.index');
    Route::post('plan-features', [PlanFeatureController::class, 'store'])->name('plan-features.store');
    Route::put('plan-features/{planFeature}', [PlanFeatureController::class, 'update'])->name('plan-features.update');
    Route::delete('plan-features/{planFeature}', [PlanFeatureController::class, 'destroy'])->name('plan-features.destroy');
    Route::get('payments', [SuperAdminController::class, 'payments'])->name('payments');
    Route::post('payments/{payment}/approve', [SuperAdminController::class, 'approvePayment'])->name('payments.approve');
    Route::post('payments/{payment}/cancel', [SuperAdminController::class, 'cancelPayment'])->name('payments.cancel');
    Route::get('contacts', [ContactMessageController::class, 'index'])->name('contacts.index');
    Route::post('contacts/{contactMessage}/reply', [ContactMessageController::class, 'reply'])->name('contacts.reply');
    Route::post('contacts/{contactMessage}/read', [ContactMessageController::class, 'markRead'])->name('contacts.read');
    Route::get('owners', [OwnerController::class, 'index'])->name('owners.index');
    Route::get('owners/{owner}', [OwnerController::class, 'show'])->name('owners.show');
    Route::post('owners/{owner}/toggle-active', [OwnerController::class, 'toggleActive'])->name('owners.toggle-active');
    Route::post('owners/{owner}/assign-plan', [OwnerController::class, 'assignPlan'])->name('owners.assign-plan');
    Route::get('payment-settings', [PaymentSettingController::class, 'index'])->name('payment-settings.index');
    Route::put('payment-settings', [PaymentSettingController::class, 'update'])->name('payment-settings.update');
    Route::get('manual-payments', [PaymentSettingController::class, 'manualPayments'])->name('manual-payments');
    Route::post('manual-payments/{payment}/approve', [PaymentSettingController::class, 'approveManualPayment'])->name('manual-payments.approve');
    Route::post('manual-payments/{payment}/reject', [PaymentSettingController::class, 'rejectManualPayment'])->name('manual-payments.reject');
});

// Parent portal routes (auth required, parent role only)
Route::middleware(['auth', 'verified', 'onboarding', 'tenant', 'role:parent'])->prefix('portal')->name('portal.')->group(function () {
    Route::get('/', [ParentController::class, 'index'])->name('index');
    Route::get('child/{studentId}', [ParentController::class, 'show'])->name('child.show');
});

require __DIR__.'/settings.php';

// Payment routes: history/initiate need auth; gateway callbacks
// (success/failure/cancel/ipn) are server- or session-less requests
// from SSLCommerz and must stay outside the auth/tenant middleware.
Route::middleware(['auth', 'verified', 'onboarding'])->group(function () {
    Route::get('payment/history', [PaymentController::class, 'history'])->name('payment.history');
    Route::match(['get', 'post'], 'payment/initiate/{plan}', [PaymentController::class, 'initiate'])->name('payment.initiate');
    Route::post('payment/manual/{plan}', [PaymentController::class, 'submitManual'])->name('payment.manual');
});

Route::match(['get', 'post'], 'payment/success', [PaymentController::class, 'success'])->name('sslc.success');
Route::match(['get', 'post'], 'payment/failure', [PaymentController::class, 'failure'])->name('sslc.failure');
Route::match(['get', 'post'], 'payment/cancel', [PaymentController::class, 'cancel'])->name('sslc.cancel');
Route::post('payment/ipn', [PaymentController::class, 'ipn'])->name('sslc.ipn');
