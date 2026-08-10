<?php

use App\Http\Controllers\ExamController;
use Illuminate\Support\Facades\Route;

Route::resource('exams', ExamController::class);
Route::post('exams/{exam}/results', [ExamController::class, 'storeResults'])->name('exams.results.store');
