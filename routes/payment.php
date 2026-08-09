<?php

use App\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;

Route::get('payment/history', [PaymentController::class, 'history'])->name('payment.history');
Route::post('payment/initiate/{plan}', [PaymentController::class, 'initiate'])->name('payment.initiate');

Route::get('payment/success', [PaymentController::class, 'success'])->name('sslc.success');
Route::get('payment/failure', [PaymentController::class, 'failure'])->name('sslc.failure');
Route::get('payment/cancel', [PaymentController::class, 'cancel'])->name('sslc.cancel');
Route::post('payment/ipn', [PaymentController::class, 'ipn'])->name('sslc.ipn');
