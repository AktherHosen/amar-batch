<?php

namespace Database\Seeders;

use App\Models\CoachingClass;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class CoachingClassSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::firstOrCreate(
            ['slug' => 'bright-minds'],
            ['name' => 'Bright Minds Academy', 'is_active' => true]
        );

        $classes = [
            ['name' => 'Pre School', 'default_fee' => 300],
            ['name' => 'Nursery', 'default_fee' => 300],
            ['name' => 'KG', 'default_fee' => 300],
            ['name' => 'Class 1', 'default_fee' => 400],
            ['name' => 'Class 2', 'default_fee' => 500],
            ['name' => 'Class 3', 'default_fee' => 500],
            ['name' => 'Class 4', 'default_fee' => 500],
            ['name' => 'Class 5', 'default_fee' => 700],
        ];

        foreach ($classes as $class) {
            CoachingClass::create(array_merge($class, ['tenant_id' => $tenant->id]));
        }
    }
}
