<?php

use App\Http\Controllers\OnboardingController;
use Illuminate\Support\Facades\Route;

Route::get('onboarding', [OnboardingController::class, 'show'])->name('onboarding.show');
Route::post('onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');
