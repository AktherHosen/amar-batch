<?php

use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;

Route::get('students/export', [StudentController::class, 'export'])->name('students.export');
Route::post('students/import', [StudentController::class, 'import'])->name('students.import');
Route::patch('students/{student}/status', [StudentController::class, 'updateStatus'])->name('students.status');
Route::resource('students', StudentController::class);
