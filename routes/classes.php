<?php

use App\Http\Controllers\CoachingClassController;
use Illuminate\Support\Facades\Route;

Route::post('coaching-classes/import', [CoachingClassController::class, 'import'])->name('coaching-classes.import');
Route::resource('coaching-classes', CoachingClassController::class)->middleware('auth');
