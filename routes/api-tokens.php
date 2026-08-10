<?php

use App\Http\Controllers\ApiTokenController;
use Illuminate\Support\Facades\Route;

Route::get('settings/api', [ApiTokenController::class, 'index'])->name('settings.api.index');
Route::post('settings/api', [ApiTokenController::class, 'store'])->name('settings.api.store');
Route::delete('settings/api/{token}', [ApiTokenController::class, 'destroy'])->name('settings.api.destroy');
