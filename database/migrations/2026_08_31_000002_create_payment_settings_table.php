<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_settings', function (Blueprint $table) {
            $table->id();
            $table->string('gateway')->default('sslcommerz');
            $table->boolean('sandbox')->default(true);
            $table->string('store_id')->nullable();
            $table->string('store_password')->nullable();
            $table->string('currency')->default('BDT');
            $table->boolean('manual_payment_enabled')->default(true);
            $table->string('manual_payment_instructions')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique('gateway');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_settings');
    }
};
