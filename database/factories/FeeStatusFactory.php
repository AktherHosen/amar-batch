<?php

namespace Database\Factories;

use App\Models\Batch;
use App\Models\FeeStatus;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<FeeStatus> */
class FeeStatusFactory extends Factory
{
    protected $model = FeeStatus::class;

    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'batch_id' => Batch::factory(),
            'month' => fake()->numberBetween(1, 12),
            'year' => fake()->numberBetween(2025, 2027),
            'amount_paid' => fake()->randomFloat(2, 0, 1000),
        ];
    }
}
