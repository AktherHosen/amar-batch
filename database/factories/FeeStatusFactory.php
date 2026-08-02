<?php

namespace Database\Factories;

use App\Models\FeeStatus;
use App\Models\Student;
use App\Models\Batch;
use Illuminate\Database\Eloquent\Factories\Factory;

class FeeStatusFactory extends Factory
{
    protected $model = FeeStatus::class;

    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'batch_id' => Batch::factory(),
            'amount_paid' => fake()->randomFloat(2, 0, 1000),
            'amount_due' => fake()->randomFloat(2, 0, 500),
            'status' => fake()->randomElement(['paid', 'partial', 'unpaid']),
            'due_date' => fake()->dateTimeBetween('now', '+1 year'),
        ];
    }
}
