<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $students = [
            [
                'name' => 'Alice Wilson',
                'email' => 'alice@academia.com',
                'phone' => '555-0101',
                'guardian_name' => 'Robert Wilson',
                'guardian_phone' => '555-0102',
                'gender' => 'female',
                'date_of_birth' => '2005-03-15',
            ],
            [
                'name' => 'Bob Davis',
                'email' => 'bob@academia.com',
                'phone' => '555-0103',
                'guardian_name' => 'Linda Davis',
                'guardian_phone' => '555-0104',
                'gender' => 'male',
                'date_of_birth' => '2004-07-22',
            ],
            [
                'name' => 'Charlie Martinez',
                'email' => 'charlie@academia.com',
                'phone' => '555-0105',
                'guardian_name' => 'Maria Martinez',
                'guardian_phone' => '555-0106',
                'gender' => 'male',
                'date_of_birth' => '2005-11-08',
            ],
            [
                'name' => 'Diana Garcia',
                'email' => 'diana@academia.com',
                'phone' => '555-0107',
                'guardian_name' => 'Carlos Garcia',
                'guardian_phone' => '555-0108',
                'gender' => 'female',
                'date_of_birth' => '2004-05-30',
            ],
            [
                'name' => 'Eve Rodriguez',
                'email' => 'eve@academia.com',
                'phone' => '555-0109',
                'guardian_name' => 'Pedro Rodriguez',
                'guardian_phone' => '555-0110',
                'gender' => 'female',
                'date_of_birth' => '2005-09-12',
            ],
        ];

        foreach ($students as $studentData) {
            $student = Student::create($studentData);

            User::create([
                'name' => $studentData['name'],
                'email' => $studentData['email'],
                'password' => Hash::make('password'),
                'role' => 'student',
                'student_id' => $student->id,
                'email_verified_at' => now(),
            ]);
        }

        $this->command->info('Student users created:');
        $this->command->table(['Name', 'Email'], [
            ['Alice Wilson', 'alice@academia.com'],
            ['Bob Davis', 'bob@academia.com'],
            ['Charlie Martinez', 'charlie@academia.com'],
            ['Diana Garcia', 'diana@academia.com'],
            ['Eve Rodriguez', 'eve@academia.com'],
        ]);
        $this->command->info('Password for all: password');
    }
}
