<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        // Create super admin (no tenant)
        User::updateOrCreate(
            ['email' => 'superadmin@academia.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => 'super_admin',
                'tenant_id' => null,
                'is_approved' => true,
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Super Admin created: superadmin@academia.com (password: password)');
    }
}
