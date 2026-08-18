<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('appearance')->default('system');
            $table->string('accent')->default('neutral');
            $table->integer('radius')->default(10);
            $table->string('date_format')->default('DD/MM/YYYY');
            $table->string('time_format')->default('12h');
            $table->string('sidebar_style')->default('full');
            $table->string('default_page')->default('dashboard');
            $table->timestamps();

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};
