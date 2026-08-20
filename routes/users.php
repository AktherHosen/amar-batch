<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::resource('users', UserController::class);
Route::post('users/{user}/role', [UserController::class, 'changeRole'])->name('users.role');
Route::post('users/{user}/deactivate', [UserController::class, 'deactivate'])->name('users.deactivate');
Route::post('users/{user}/reactivate', [UserController::class, 'reactivate'])->name('users.reactivate');
Route::post('users/{user}/approve', [UserController::class, 'approve'])->name('users.approve');
Route::post('users/{user}/reject', [UserController::class, 'reject'])->name('users.reject');