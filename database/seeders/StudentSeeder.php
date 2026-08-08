<?php

namespace Database\Seeders;

use App\Models\CoachingClass;
use App\Models\Student;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $nursery = CoachingClass::where('name', 'Nursery')->first();
        $kg = CoachingClass::where('name', 'KG')->first();
        $class2 = CoachingClass::where('name', 'Class 2')->first();
        $class3 = CoachingClass::where('name', 'Class 3')->first();
        $class4 = CoachingClass::where('name', 'Class 4')->first();
        $class5 = CoachingClass::where('name', 'Class 5')->first();

        $students = [
            ['name' => 'Ishanto', 'coaching_class_id' => $class3?->id, 'joined_at' => '2026-05-03', 'gender' => 'male'],
            ['name' => 'Saimon', 'coaching_class_id' => $class2?->id, 'joined_at' => '2026-05-03', 'gender' => 'male'],
            ['name' => 'Saima', 'coaching_class_id' => $class2?->id, 'joined_at' => '2026-05-03', 'gender' => 'female'],
            ['name' => 'Mehrab', 'coaching_class_id' => $class2?->id, 'joined_at' => '2026-05-04', 'gender' => 'male'],
            ['name' => 'Muntaha', 'coaching_class_id' => $class2?->id, 'joined_at' => '2026-05-12', 'gender' => 'female'],
            ['name' => 'Ripa', 'coaching_class_id' => $class2?->id, 'joined_at' => '2026-06-10', 'gender' => 'female'],
            ['name' => 'Rahat', 'coaching_class_id' => $nursery?->id, 'joined_at' => '2026-06-10', 'gender' => 'male'],
            ['name' => 'Samiya', 'coaching_class_id' => $class2?->id, 'joined_at' => '2026-08-1', 'gender' => 'female'],
            ['name' => 'Jihad', 'coaching_class_id' => $kg?->id, 'joined_at' => '2026-07-01', 'gender' => 'male'],
            ['name' => 'Saimon', 'coaching_class_id' => $kg?->id, 'joined_at' => '2026-07-18', 'gender' => 'male'],
            ['name' => 'Emon', 'coaching_class_id' => $class5?->id, 'joined_at' => '2026-07-18', 'gender' => 'male'],
            ['name' => 'Sahidul', 'coaching_class_id' => $class4?->id, 'joined_at' => '2026-08-02', 'gender' => 'male'],
        ];

        foreach ($students as $studentData) {
            Student::create($studentData);
        }
    }
}