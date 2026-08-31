<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('plan_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action'); // created, upgraded, downgraded, renewed, cancelled, expired, trial_started, trial_ended
            $table->string('status');
            $table->string('billing_type')->nullable();
            $table->decimal('amount', 10, 2)->nullable();
            $table->string('old_plan_name')->nullable();
            $table->string('new_plan_name')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_history');
    }
};
