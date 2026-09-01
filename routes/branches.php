<?php

use App\Http\Controllers\BranchController;
use Illuminate\Support\Facades\Route;

Route::middleware(['plan.feature:multi_branch'])->group(function () {
    Route::post('branches/import', [BranchController::class, 'import'])->name('branches.import');

    Route::resource('branches', BranchController::class);
});
