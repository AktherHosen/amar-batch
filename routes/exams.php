<?php

use App\Http\Controllers\ExamController;
use Illuminate\Support\Facades\Route;

Route::post('exams/import', [ExamController::class, 'import'])->name('exams.import');
Route::resource('exams', ExamController::class);
Route::post('exams/{exam}/results', [ExamController::class, 'storeResults'])->name('exams.results.store');
