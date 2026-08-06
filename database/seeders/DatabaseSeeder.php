<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\App;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (App::environment('production')) {
            $this->command->error('Seeding is not allowed in production!');

            return;
        }

        $this->call([
            AdminSeeder::class,
            TeacherSeeder::class,
            CoachingClassSeeder::class,
            StudentSeeder::class,
        ]);
    }
}
