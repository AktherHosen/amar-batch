<?php

namespace App\Console\Commands;

use App\Models\Attendance;
use App\Models\NotificationSchedule;
use App\Models\SmsSetting;
use App\Models\Tenant;
use App\Services\SmsService;
use Illuminate\Console\Command;

class SendAbsenceAlerts extends Command
{
    protected $signature = 'sms:absence-alerts';

    protected $description = 'Send SMS alerts for students marked absent today';

    public function handle(): int
    {
        $tenants = Tenant::where('is_active', true)->get();
        $today = now()->toDateString();
        $sent = 0;

        foreach ($tenants as $tenant) {
            $schedule = NotificationSchedule::forType($tenant->id, 'absence_alert');

            if (! $schedule || ! $schedule->is_enabled) {
                continue;
            }

            $setting = SmsSetting::forTenant($tenant->id);
            if (! $setting || ! $setting->is_enabled) {
                continue;
            }

            $absentStudents = Attendance::where('tenant_id', $tenant->id)
                ->whereDate('date', $today)
                ->where('status', 'absent')
                ->with('student', 'batch')
                ->get();

            if ($absentStudents->isEmpty()) {
                continue;
            }

            $sms = new SmsService($tenant->id);

            foreach ($absentStudents as $attendance) {
                $student = $attendance->student;
                if (! $student || ! $student->phone) {
                    continue;
                }

                $message = "Dear Parent, {$student->name} was absent on {$today} for {$attendance->batch?->name ?? 'class'}. - {$tenant->name}";

                $sms->send($student->phone, $message, 'absence_alert');
                $sent++;
            }

            $schedule->update(['last_run_at' => now()]);
        }

        $this->info("Absence alerts sent: {$sent}");

        return Command::SUCCESS;
    }
}
