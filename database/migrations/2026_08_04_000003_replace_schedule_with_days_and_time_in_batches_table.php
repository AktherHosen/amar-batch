<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('batches', function (Blueprint $table) {
            $table->string('days')->nullable()->after('subject');
            $table->string('time')->nullable()->after('days');
            $table->dropColumn('schedule');
        });
    }

    public function down(): void
    {
        Schema::table('batches', function (Blueprint $table) {
            $table->json('schedule')->nullable()->after('subject');
            $table->dropColumn(['days', 'time']);
        });
    }
};
