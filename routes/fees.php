<?php

use App\Http\Controllers\FeeStatusController;
use App\Http\Controllers\FeeReceiptController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('fees')->name('fees.')->group(function () {
    Route::get('/', [FeeStatusController::class, 'index'])->name('index');
    Route::get('/create', [FeeStatusController::class, 'create'])->name('create');
    Route::post('/', [FeeStatusController::class, 'store'])->name('store');
    Route::post('/import', [FeeStatusController::class, 'import'])->name('import');
    Route::delete('/clear-student', [FeeStatusController::class, 'destroyStudentBatch'])->name('clear-student');
    Route::get('/{fee}/edit', [FeeStatusController::class, 'edit'])->name('edit');
    Route::put('/{fee}', [FeeStatusController::class, 'update'])->name('update');
    Route::delete('/{fee}', [FeeStatusController::class, 'destroy'])->name('destroy');
});

Route::middleware(['auth', 'verified'])->prefix('fees/receipts')->name('fees.receipts.')->group(function () {
    Route::get('/', [FeeReceiptController::class, 'index'])->name('index');
    Route::post('/', [FeeReceiptController::class, 'store'])->name('store');
    Route::get('/{receipt}', [FeeReceiptController::class, 'show'])->name('show');
    Route::delete('/{receipt}', [FeeReceiptController::class, 'destroy'])->name('destroy');
});
