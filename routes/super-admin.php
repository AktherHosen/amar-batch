<?php

use App\Http\Controllers\SuperAdmin\PlanController;
use App\Http\Controllers\SuperAdmin\SuperAdminController;
use App\Http\Controllers\SuperAdmin\TenantController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:super_admin'])->prefix('super-admin')->name('super-admin.')->group(function () {
    Route::get('/dashboard', [SuperAdminController::class, 'dashboard'])->name('dashboard');

    Route::resource('tenants', TenantController::class)->only(['index', 'show']);
    Route::post('tenants/{tenant}/toggle-active', [TenantController::class, 'toggleActive'])->name('tenants.toggle-active');

    Route::resource('plans', PlanController::class)->except(['show']);

    Route::get('payments', [SuperAdminController::class, 'payments'])->name('payments');
    Route::post('payments/{payment}/approve', [SuperAdminController::class, 'approvePayment'])->name('payments.approve');
    Route::post('payments/{payment}/cancel', [SuperAdminController::class, 'cancelPayment'])->name('payments.cancel');

    Route::get('tenants/{tenant}/detail', [SuperAdminController::class, 'showTenant'])->name('tenants.detail');
});
