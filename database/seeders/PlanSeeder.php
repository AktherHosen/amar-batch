<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\PlanFeature;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $features = [
            ['name' => 'Attendance Tracking', 'slug' => 'attendance', 'is_system' => true],
            ['name' => 'Fee Collection', 'slug' => 'fees', 'is_system' => true],
            ['name' => 'Exam Management', 'slug' => 'exams', 'is_system' => true],
            ['name' => 'Reports & Analytics', 'slug' => 'reports', 'is_system' => true],
            ['name' => 'Notifications', 'slug' => 'notifications', 'is_system' => true],
            ['name' => 'Custom Branding', 'slug' => 'custom_branding', 'is_system' => true],
            ['name' => 'Multi-branch Support', 'slug' => 'multi_branch', 'is_system' => true],
            ['name' => 'API Access', 'slug' => 'api_access', 'is_system' => true],
            ['name' => 'SMS Notifications', 'slug' => 'sms_notifications', 'is_system' => true],
        ];

        foreach ($features as $feature) {
            PlanFeature::updateOrCreate(
                ['slug' => $feature['slug']],
                $feature
            );
        }

        $plans = [
            [
                'name' => 'Free Trial',
                'slug' => 'free-trial',
                'description' => 'Try Amar Batch for free with limited features.',
                'price_monthly' => 0,
                'price_yearly' => 0,
                'max_students' => 30,
                'max_staff' => 2,
                'max_batches' => 5,
                'features' => ['attendance', 'fees'],
                'is_active' => true,
                'is_default' => true,
            ],
            [
                'name' => 'Basic',
                'slug' => 'basic',
                'description' => 'For small coaching centers getting started.',
                'price_monthly' => 999,
                'price_yearly' => 9990,
                'max_students' => 100,
                'max_staff' => 5,
                'max_batches' => 15,
                'features' => ['attendance', 'fees', 'exams', 'reports', 'sms_notifications'],
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'description' => 'For growing coaching centers with advanced needs.',
                'price_monthly' => 2499,
                'price_yearly' => 24990,
                'max_students' => 500,
                'max_staff' => 20,
                'max_batches' => 50,
                'features' => ['attendance', 'fees', 'exams', 'reports', 'notifications', 'custom_branding', 'sms_notifications'],
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'For large coaching chains and franchises.',
                'price_monthly' => 4999,
                'price_yearly' => 49990,
                'max_students' => -1,
                'max_staff' => -1,
                'max_batches' => -1,
                'features' => ['attendance', 'fees', 'exams', 'reports', 'notifications', 'custom_branding', 'multi_branch', 'api_access', 'sms_notifications'],
                'is_active' => true,
                'is_default' => false,
            ],
        ];

        foreach ($plans as $plan) {
            Plan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }

        $this->command->info('Plans seeded successfully.');
    }
}
