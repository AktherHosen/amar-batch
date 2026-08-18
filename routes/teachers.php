<?php

use App\Http\Controllers\TeacherController;
use Illuminate\Support\Facades\Route;

Route::post('teachers/import', [TeacherController::class, 'import'])->name('teachers.import');
Route::resource('teachers', TeacherController::class);
Route::post('teachers/{teacher}/approve', [TeacherController::class, 
'approve'])->name('teachers.approve');
Route::post('teachers/{teacher}/reject', [TeacherController::class, 
'reject'])->name('teachers.reject');
Route::patch('teachers/{teacher}/status', [TeacherController::class, 
'updateStatus'])->name('teachers.status');