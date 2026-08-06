<?php

use App\Http\Controllers\TeacherController;
use Illuminate\Support\Facades\Route;

Route::resource('teachers', TeacherController::class);
