<?php

use App\Http\Controllers\AttendanceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('attendance')->name('attendance.')->group(function () {
    Route::get('/', [AttendanceController::class, 'index'])->name('index');
    Route::get('/create', [AttendanceController::class, 'create'])->name('create');
    Route::post('/', [AttendanceController::class, 'store'])->name('store');
    Route::delete('/{attendance}', [AttendanceController::class, 'destroy'])->name('destroy');
});
