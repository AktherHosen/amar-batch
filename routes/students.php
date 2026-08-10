<?php

use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;

Route::get('students/export', [StudentController::class, 'export'])->name('students.export');
Route::resource('students', StudentController::class);
