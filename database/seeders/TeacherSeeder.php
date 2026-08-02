<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TeacherSeeder extends Seeder
{
    public function run(): void
    {
        $teachers = [
            ['name' => 'John Smith', 'email' => 'john@academia.com'],
            ['name' => 'Sarah Johnson', 'email' => 'sarah@academia.com'],
            ['name' => 'Michael Brown', 'email' => 'michael@academia.com'],
        ];

        foreach ($teachers as $teacher) {
            User::create([
                'name' => $teacher['name'],
                'email' => $teacher['email'],
                'password' => Hash::make('password'),
                'role' => 'teacher',
                'email_verified_at' => now(),
            ]);
        }

        $this->command->info('Teacher users created:');
        $this->command->table(['Name', 'Email'], [
            ['John Smith', 'john@academia.com'],
            ['Sarah Johnson', 'sarah@academia.com'],
            ['Michael Brown', 'michael@academia.com'],
        ]);
        $this->command->info('Password for all: password');
    }
}
