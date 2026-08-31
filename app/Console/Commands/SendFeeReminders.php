<?php

namespace App\Console\Commands;

use App\Models\Enrollment;
use App\Models\FeeStatus;
use App\Models\NotificationSchedule;
use App\Models\SmsSetting;
use App\Models\Tenant;
use App\Services\SmsService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendFeeReminders extends Command
{
    protected $signature = 'sms:fee-reminders';

    protected $description = 'Send SMS fee reminders for upcoming and overdue payments';

    public function handle(): int
    {
        $tenants = Tenant::where('is_active', true)->get();
        $today = Carbon::now();
        $sent = 0;

        foreach ($tenants as $tenant) {
            $schedule = NotificationSchedule::forType($tenant->id, 'fee_reminder');

            if (! $schedule || ! $schedule->is_enabled) {
                continue;
            }

            $setting = SmsSetting::forTenant($tenant->id);
            if (! $setting || ! $setting->is_enabled) {
                continue;
            }

            $config = $schedule->config ?? [];
            $daysBefore = $config['days_before'] ?? 7;

            $currentMonth = $today->month;
            $currentYear = $today->year;

            $enrollments = Enrollment::where('tenant_id', $tenant->id)
                ->where('status', 'active')
                ->with('student', 'batch')
                ->get();

            $studentPhones = [];

            foreach ($enrollments as $enrollment) {
                $student = $enrollment->student;
                if (! $student || ! $student->phone || $student->status !== 'active') {
                    continue;
                }

                $hasPaid = FeeStatus::where('student_id', $student->id)
                    ->where('batch_id', $enrollment->batch_id)
                    ->where('month', $currentMonth)
                    ->where('year', $currentYear)
                    ->exists();

                if (! $hasPaid) {
                    $studentPhones[$student->id] = [
                        'phone' => $student->phone,
                        'student_name' => $student->name,
                        'batch_name' => $enrollment->batch?->name ?? 'N/A',
                        'coaching_name' => $tenant->name,
                    ];
                }
            }

            if (empty($studentPhones)) {
                continue;
            }

            $monthName = $today->format('F');
            $sms = new SmsService($tenant->id);

            foreach ($studentPhones as $data) {
                $message = "Dear Parent, monthly fee of {$data['batch_name']} for {$monthName} is unpaid. Please pay soon. - {$data['coaching_name']}";

                $sms->send($data['phone'], $message, 'fee_reminder');
                $sent++;
            }

            $schedule->update(['last_run_at' => $today]);
        }

        $this->info("Fee reminders sent: {$sent}");

        return Command::SUCCESS;
    }
}
