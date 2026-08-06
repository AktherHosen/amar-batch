<?php

use App\Http\Controllers\FeeStatusController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('fees')->name('fees.')->group(function () {
    Route::get('/', [FeeStatusController::class, 'index'])->name('index');
    Route::get('/create', [FeeStatusController::class, 'create'])->name('create');
    Route::post('/', [FeeStatusController::class, 'store'])->name('store');
    Route::get('/{fee}/edit', [FeeStatusController::class, 'edit'])->name('edit');
    Route::put('/{fee}', [FeeStatusController::class, 'update'])->name('update');
    Route::delete('/{fee}', [FeeStatusController::class, 'destroy'])->name('destroy');
});
