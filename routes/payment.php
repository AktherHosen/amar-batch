<?php

use App\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;

Route::get('payment/history', [PaymentController::class, 'history'])->name('payment.history');
Route::match(['get', 'post'], 'payment/initiate/{plan}', [PaymentController::class, 'initiate'])->name('payment.initiate');

Route::match(['get', 'post'], 'payment/success', [PaymentController::class, 'success'])->name('sslc.success');
Route::match(['get', 'post'], 'payment/failure', [PaymentController::class, 'failure'])->name('sslc.failure');
Route::match(['get', 'post'], 'payment/cancel', [PaymentController::class, 'cancel'])->name('sslc.cancel');
Route::post('payment/ipn', [PaymentController::class, 'ipn'])->name('sslc.ipn');
