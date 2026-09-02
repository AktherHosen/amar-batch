<?php

use App\Http\Controllers\AttendanceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('attendance')->name('attendance.')->group(function () {
    Route::get('/', [AttendanceController::class, 'index'])->name('index');
    Route::get('/calendar', [AttendanceController::class, 'calendar'])->name('calendar');
    Route::get('/calendar-data', [AttendanceController::class, 'calendarData'])->name('calendarData');
    Route::get('/create', [AttendanceController::class, 'create'])->name('create');
    Route::get('/students', [AttendanceController::class, 'students'])->name('students');
    Route::get('/{attendance}/edit', [AttendanceController::class, 'edit'])->name('edit');
    Route::post('/', [AttendanceController::class, 'store'])->name('store');
    Route::post('/import', [AttendanceController::class, 'import'])->name('import');
    Route::put('/{attendance}', [AttendanceController::class, 'update'])->name('update');
    Route::delete('/{attendance}', [AttendanceController::class, 'destroy'])->name('destroy');
});
