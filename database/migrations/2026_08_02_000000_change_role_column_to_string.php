<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            Schema::table('users', function ($table) {
                $table->string('role')->default('teacher')->change();
            });
        } else {
            DB::statement('ALTER TABLE users RENAME COLUMN role TO role_old');
            DB::statement('ALTER TABLE users ADD COLUMN role VARCHAR NOT NULL DEFAULT \'teacher\'');
            DB::statement('UPDATE users SET role = role_old');
            DB::statement('ALTER TABLE users DROP COLUMN role_old');
        }
    }

    public function down(): void
    {
        Schema::table('users', function ($table) {
            $table->enum('role', ['admin', 'teacher', 'student'])->default('teacher')->change();
        });
    }
};
