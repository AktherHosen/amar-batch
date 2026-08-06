<?php

namespace Database\Factories;

use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

class EnrollmentFactory extends Factory
{
    protected $model = Enrollment::class;

    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'batch_id' => Batch::factory(),
            'enrolled_at' => fake()->dateTimeBetween('-1 year', 'now'),
            'status' => 'active',
        ];
    }
}
