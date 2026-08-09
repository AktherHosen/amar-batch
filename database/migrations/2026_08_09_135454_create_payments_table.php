<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('plan_id')->constrained()->cascadeOnDelete();
            $table->string('txid')->nullable()->unique();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 10)->default('BDT');
            $table->string('status')->default('pending'); // pending, success, failed, cancelled, refunded
            $table->string('payment_method')->nullable();
            $table->string('billing_type')->default('monthly'); // monthly, yearly
            $table->json('gateway_response')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'status']);
            $table->index('txid');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
