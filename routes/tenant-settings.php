<?php

use App\Http\Controllers\TenantSettingsController;
use Illuminate\Support\Facades\Route;

Route::get('settings/tenant', [TenantSettingsController::class, 'edit'])->name('settings.tenant.edit');
Route::put('settings/tenant', [TenantSettingsController::class, 'update'])->name('settings.tenant.update');
