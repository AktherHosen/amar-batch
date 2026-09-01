<?php

use App\Http\Controllers\MessageController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('messages')->name('messages.')->group(function () {
    Route::get('/', [MessageController::class, 'index'])->name('index');
    Route::post('/', [MessageController::class, 'store'])->name('store');
    Route::get('/{message}', [MessageController::class, 'show'])->name('show');
    Route::post('/{message}/reply', [MessageController::class, 'reply'])->name('reply');
    Route::post('/{message}/read', [MessageController::class, 'markAsRead'])->name('read');
    Route::delete('/{message}', [MessageController::class, 'destroy'])->name('destroy');
});
