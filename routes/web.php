<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/students.php';
require __DIR__.'/batches.php';
require __DIR__.'/teachers.php';
require __DIR__.'/fees.php';
require __DIR__.'/attendance.php';
