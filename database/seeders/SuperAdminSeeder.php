<?php

namespace Database\Seeders;

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
            ['email' => 'superadmin@amarbatch.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => 'super_admin',
                'is_approved' => true,
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Super Admin created: superadmin@amarbatch.com (password: password)');
    }
}
