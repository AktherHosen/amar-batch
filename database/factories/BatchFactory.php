<?php

namespace Database\Factories;

use App\Models\Batch;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Batch> */
class BatchFactory extends Factory
{
    protected $model = Batch::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true)[0].' Batch',
            'capacity' => fake()->numberBetween(10, 50),
            'status' => 'active',
            'start_date' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
