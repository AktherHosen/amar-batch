<?php

use App\Http\Controllers\NoticeController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('notices')->name('notices.')->group(function () {
    Route::get('/', [NoticeController::class, 'index'])->name('index');
    Route::get('/create', [NoticeController::class, 'create'])->name('create');
    Route::post('/', [NoticeController::class, 'store'])->name('store');
    Route::post('/import', [NoticeController::class, 'import'])->name('import');
    Route::get('/{notice}', [NoticeController::class, 'show'])->name('show');
    Route::get('/{notice}/edit', [NoticeController::class, 'edit'])->name('edit');
    Route::put('/{notice}', [NoticeController::class, 'update'])->name('update');
    Route::delete('/{notice}', [NoticeController::class, 'destroy'])->name('destroy');
});
