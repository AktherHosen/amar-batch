<?php

use App\Http\Controllers\HolidayController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('holidays')->name('holidays.')->group(function () {
    Route::get('/', [HolidayController::class, 'index'])->name('index');
    Route::get('/create', [HolidayController::class, 'create'])->name('create');
    Route::post('/', [HolidayController::class, 'store'])->name('store');
    Route::post('/import', [HolidayController::class, 'import'])->name('import');
    Route::get('/{holiday}', [HolidayController::class, 'show'])->name('show');
    Route::get('/{holiday}/edit', [HolidayController::class, 'edit'])->name('edit');
    Route::put('/{holiday}', [HolidayController::class, 'update'])->name('update');
    Route::delete('/{holiday}', [HolidayController::class, 'destroy'])->name('destroy');
    Route::post('/check-date', [HolidayController::class, 'checkDate'])->name('check-date');
});
