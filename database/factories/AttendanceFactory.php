<?php

namespace Database\Factories;

use App\Models\Attendance;
use App\Models\Student;
use App\Models\Batch;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AttendanceFactory extends Factory
{
    protected $model = Attendance::class;

    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'batch_id' => Batch::factory(),
            'marked_by' => User::factory(),
            'date' => fake()->dateTimeBetween('-1 month', 'now'),
            'status' => fake()->randomElement(['present', 'absent', 'late']),
        ];
    }
}
