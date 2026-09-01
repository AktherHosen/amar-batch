<?php

use App\Http\Controllers\SmsController;
use Illuminate\Support\Facades\Route;

Route::prefix('sms')->name('sms.')->middleware(['plan.feature:sms_notifications'])->group(function () {
    Route::get('settings', [SmsController::class, 'settings'])->name('settings');
    Route::post('settings', [SmsController::class, 'updateSettings'])->name('settings.update');
    Route::post('schedules', [SmsController::class, 'updateSchedules'])->name('schedules.update');
    Route::get('send', [SmsController::class, 'sendPage'])->name('send');
    Route::post('send', [SmsController::class, 'send'])->name('send.store');
    Route::get('logs', [SmsController::class, 'logs'])->name('logs');
});
