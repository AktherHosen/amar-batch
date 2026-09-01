<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('subscriptions:check-expired')->daily();

Schedule::command('sms:fee-reminders')->dailyAt('09:00');
Schedule::command('sms:absence-alerts')->dailyAt('18:00');
Schedule::command('sms:exam-reminders')->dailyAt('08:00');
