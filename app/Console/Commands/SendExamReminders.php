<?php

namespace App\Console\Commands;

use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\NotificationSchedule;
use App\Models\SmsSetting;
use App\Models\Tenant;
use App\Services\SmsService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendExamReminders extends Command
{
    protected $signature = 'sms:exam-reminders';

    protected $description = 'Send SMS reminders for upcoming exams';

    public function handle(): int
    {
        $tenants = Tenant::where('is_active', true)->get();
        $today = Carbon::now();
        $sent = 0;

        foreach ($tenants as $tenant) {
            $schedule = NotificationSchedule::forType($tenant->id, 'exam_reminder');

            if (! $schedule || ! $schedule->is_enabled) {
                continue;
            }

            $setting = SmsSetting::forTenant($tenant->id);
            if (! $setting || ! $setting->is_enabled) {
                continue;
            }

            $config = $schedule->config ?? [];
            $daysBefore = $config['days_before'] ?? 3;

            $upcomingExams = Exam::where('tenant_id', $tenant->id)
                ->whereDate('exam_date', '>', $today)
                ->whereDate('exam_date', '<=', $today->copy()->addDays($daysBefore))
                ->with('batch')
                ->get();

            if ($upcomingExams->isEmpty()) {
                continue;
            }

            $sms = new SmsService($tenant->id);

            foreach ($upcomingExams as $exam) {
                $enrolledStudents = Enrollment::where('batch_id', $exam->batch_id)
                    ->where('status', 'active')
                    ->with('student')
                    ->get();

                foreach ($enrolledStudents as $enrollment) {
                    $student = $enrollment->student;
                    if (! $student || ! $student->phone) {
                        continue;
                    }

                    $examDate = Carbon::parse($exam->exam_date)->format('d M Y');
                    $message = "Reminder: {$exam->title} ({$exam->subject}) is scheduled for {$examDate} for {$exam->batch?->name ?? 'your batch'}. Total marks: {$exam->total_marks}. - {$tenant->name}";

                    $sms->send($student->phone, $message, 'exam_reminder');
                    $sent++;
                }
            }

            $schedule->update(['last_run_at' => $today]);
        }

        $this->info("Exam reminders sent: {$sent}");

        return Command::SUCCESS;
    }
}
