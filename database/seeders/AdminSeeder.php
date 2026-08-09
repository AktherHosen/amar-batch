<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Create a demo tenant
        $tenant = Tenant::create([
            'name' => 'Bright Minds Academy',
            'slug' => 'bright-minds',
            'email' => 'info@brightminds.com',
            'phone' => '+880 1712-345678',
            'is_active' => true,
        ]);

        $plan = Plan::where('is_default', true)->first();
        if ($plan) {
            Subscription::create([
                'tenant_id' => $tenant->id,
                'plan_id' => $plan->id,
                'status' => 'active',
            ]);
        }

        // Create owner for the demo tenant
        User::create([
            'name' => 'Admin',
            'email' => 'admin@amarbatch.com',
            'password' => Hash::make('password'),
            'role' => 'owner',
            'tenant_id' => $tenant->id,
            'is_approved' => true,
            'onboarding_complete' => true,
            'email_verified_at' => now(),
        ]);

        $this->command->info('Admin user created: admin@amarbatch.com (password: password)');
        $this->command->info("Assigned to tenant: {$tenant->name}");
    }
}
