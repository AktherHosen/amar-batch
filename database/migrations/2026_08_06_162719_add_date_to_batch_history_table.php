<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('batch_history', function (Blueprint $table) {
            $table->date('action_date')->nullable()->after('action');
        });
    }

    public function down(): void
    {
        Schema::table('batch_history', function (Blueprint $table) {
            $table->dropColumn('action_date');
        });
    }
};
