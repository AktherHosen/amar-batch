<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->date('joined_at')->nullable()->after('status');
            $table->foreignId('coaching_class_id')->nullable()->after('joined_at')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn('joined_at');
            $table->dropForeign(['coaching_class_id']);
            $table->dropColumn('coaching_class_id');
        });
    }
};
