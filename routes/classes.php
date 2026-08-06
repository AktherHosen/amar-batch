<?php

use App\Http\Controllers\CoachingClassController;
use Illuminate\Support\Facades\Route;

Route::resource('coaching-classes', CoachingClassController::class)->middleware('auth');
