<?php

namespace Database\Seeders;

use App\Models\CoachingClass;
use Illuminate\Database\Seeder;

class CoachingClassSeeder extends Seeder
{
    public function run(): void
    {
        $classes = [
            ['name' => 'Nursery', 'default_fee' => 300],
            ['name' => 'KG', 'default_fee' => 300],
            ['name' => 'Class 1', 'default_fee' => 500],
            ['name' => 'Class 2', 'default_fee' => 500],
            ['name' => 'Class 3', 'default_fee' => 500],
            ['name' => 'Class 4', 'default_fee' => 500],
            ['name' => 'Class 5', 'default_fee' => 500],
        ];

        foreach ($classes as $class) {
            CoachingClass::create($class);
        }
    }
}
