<?php

use App\Http\Controllers\BranchController;
use Illuminate\Support\Facades\Route;

Route::post('branches/import', [BranchController::class, 'import'])->name('branches.import');

Route::resource('branches', BranchController::class);
