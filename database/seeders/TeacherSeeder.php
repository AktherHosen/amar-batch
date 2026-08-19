<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TeacherSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::firstOrCreate(
            ['slug' => 'bright-minds'],
            ['name' => 'Bright Minds Academy', 'is_active' => true]
        );

        $teachers = [
            ['name' => 'Salma Chy', 'email' => 'salmachy4000@gmail.com'],
            ['name' => 'Md Akther Hosen', 'email' => 'mdaktherhosen16@gmail.com'],
        ];

        foreach ($teachers as $teacher) {
            User::create([
                'name' => $teacher['name'],
                'email' => $teacher['email'],
                'password' => Hash::make('password'),
                'role' => 'teacher',
                'tenant_id' => $tenant->id,
                'is_approved' => true,
                'email_verified_at' => now(),
            ]);
        }

        $this->command->info('Staff users created:');
        $this->command->table(['Name', 'Email'], [
            ['Salma Chy', 'salmachy4000@gmail.com'],
            ['Md Akther Hosen', 'mdaktherhosen16@gmail.com'],
        ]);
        $this->command->info('Password for all: password');
    }
}
