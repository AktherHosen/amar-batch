<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->numerify('555-0###'),
            'status' => 'active',
            'guardian_name' => fake()->name(),
            'guardian_phone' => fake()->numerify('555-0###'),
        ];
    }
}
