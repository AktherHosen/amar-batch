<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Student> */
class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'phone' => fake()->numerify('555-0###'),
            'status' => 'active',
            'joined_at' => fake()->dateTimeBetween('-1 year', 'now'),
            'guardian_name' => fake()->name(),
            'guardian_phone' => fake()->numerify('555-0###'),
        ];
    }
}
