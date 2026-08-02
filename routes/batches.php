<?php

use App\Http\Controllers\BatchController;
use App\Http\Controllers\EnrollmentController;
use Illuminate\Support\Facades\Route;

Route::resource('batches', BatchController::class);
Route::post('batches/{batch}/assign-teacher', [BatchController::class, 'assignTeacher'])->name('batches.assign-teacher');
Route::delete('batches/{batch}/remove-teacher', [BatchController::class, 'removeTeacher'])->name('batches.remove-teacher');

Route::post('batches/{batch}/enroll', [EnrollmentController::class, 'store'])->name('enrollments.store');
Route::put('enrollments/{enrollment}', [EnrollmentController::class, 'update'])->name('enrollments.update');
Route::delete('enrollments/{enrollment}', [EnrollmentController::class, 'destroy'])->name('enrollments.destroy');
