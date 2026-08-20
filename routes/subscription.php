<?php

use App\Http\Controllers\SubscriptionController;
use Illuminate\Support\Facades\Route;

Route::get('subscription', [SubscriptionController::class, 'index'])->name('subscription.index');
Route::post('subscription/upgrade/{plan}', [SubscriptionController::class, 'upgrade'])->name('subscription.upgrade');
