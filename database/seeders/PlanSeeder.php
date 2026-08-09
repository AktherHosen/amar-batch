<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free Trial',
                'slug' => 'free-trial',
                'description' => 'Try Academia for free with limited features.',
                'price_monthly' => 0,
                'price_yearly' => 0,
                'max_students' => 30,
                'max_staff' => 2,
                'max_batches' => 5,
                'features' => ['students', 'batches', 'attendance', 'fees'],
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
                'features' => ['students', 'batches', 'attendance', 'fees', 'exams', 'reports'],
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
                'features' => ['students', 'batches', 'attendance', 'fees', 'exams', 'reports', 'notifications', 'custom_branding'],
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
                'features' => ['students', 'batches', 'attendance', 'fees', 'exams', 'reports', 'notifications', 'custom_branding', 'multi_branch', 'api_access'],
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
