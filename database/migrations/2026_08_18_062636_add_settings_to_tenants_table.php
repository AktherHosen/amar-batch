<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('currency_symbol')->nullable()->default('৳');
            $table->string('academic_year')->nullable()->default('2025-26');
            $table->string('receipt_prefix')->nullable()->default('RCT');
            $table->string('student_id_prefix')->nullable()->default('STU');
            $table->string('default_attendance')->nullable()->default('manual');
            $table->text('invoice_footer')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'currency_symbol',
                'academic_year',
                'receipt_prefix',
                'student_id_prefix',
                'default_attendance',
                'invoice_footer',
            ]);
        });
    }
};
