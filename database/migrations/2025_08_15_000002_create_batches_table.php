<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('batches', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('subject')->nullable();
            $table->json('schedule')->nullable();
            $table->integer('capacity')->default(30);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->decimal('fees_amount', 10, 2)->default(0);
            $table->enum('status', ['active', 'inactive', 'archived'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('batches');
    }
};
