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
            ['name' => 'Salma Chy', 'email' => 'salmachy4000@gmail.com'],
            ['name' => 'Md Akther Hosen', 'email' => 'mdaktherhosen16@gmail.com'],
        ];

        foreach ($teachers as $teacher) {
            User::create([
                'name' => $teacher['name'],
                'email' => $teacher['email'],
                'password' => Hash::make('password'),
                'role' => 'teacher',
                'is_approved' => true,
                'email_verified_at' => now(),
            ]);
        }

        $this->command->info('Teacher users created:');
        $this->command->table(['Name', 'Email'], [
            ['Salma Chy', 'salmachy4000@gmail.com'],
            ['Md Akther Hosen', 'mdaktherhosen16@gmail.com'],
        ]);
        $this->command->info('Password for all: password');
    }
}
