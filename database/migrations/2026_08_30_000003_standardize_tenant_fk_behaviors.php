<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private function hasForeignKey(string $table, string $name): bool
    {
        foreach (Schema::getForeignKeys($table) as $fk) {
            $fkName = is_array($fk) ? ($fk['name'] ?? '') : ($fk->name ?? '');
            if ($fkName === $name) {
                return true;
            }
        }

        return false;
    }

    private function dropForeignKeyIfExists(string $table, string $fkName): void
    {
        if ($this->hasForeignKey($table, $fkName)) {
            Schema::table($table, fn (Blueprint $t) => $t->dropForeign($fkName));
        }
    }

    public function up(): void
    {
        $mysql = DB::getDriverName() !== 'sqlite';

        if (! $mysql) {
            return;
        }

        // Standardize all tenant_id foreign keys to restrictOnDelete
        $tables = [
            'subscriptions',
            'payments',
            'fee_receipts',
            'notices',
            'holidays',
            'roles',
            'exams',
            'exam_results',
            'in_app_notifications',
            'branches',
        ];

        foreach ($tables as $table) {
            if (! Schema::hasTable($table) || ! Schema::hasColumn($table, 'tenant_id')) {
                continue;
            }

            $fk = "{$table}_tenant_id_foreign";
            $this->dropForeignKeyIfExists($table, $fk);

            if (! $this->hasForeignKey($table, $fk)) {
                Schema::table($table, fn (Blueprint $t) => $t->foreign('tenant_id')->references('id')->on('tenants')->restrictOnDelete());
            }
        }
    }

    public function down(): void
    {
        $mysql = DB::getDriverName() !== 'sqlite';

        if (! $mysql) {
            return;
        }

        // Revert to original behaviors
        $restrict = ['users', 'students', 'batches', 'teacher_batch', 'enrollments', 'fee_statuses', 'attendances', 'coaching_classes', 'batch_histories'];
        $cascade = ['subscriptions', 'payments', 'fee_receipts', 'notices', 'holidays', 'roles'];
        $null = ['exams', 'exam_results', 'in_app_notifications', 'branches'];

        foreach ($restrict as $table) {
            // Already restrictOnDelete, skip
        }

        foreach ($cascade as $table) {
            if (! Schema::hasTable($table) || ! Schema::hasColumn($table, 'tenant_id')) {
                continue;
            }
            $fk = "{$table}_tenant_id_foreign";
            $this->dropForeignKeyIfExists($table, $fk);
            if (! $this->hasForeignKey($table, $fk)) {
                Schema::table($table, fn (Blueprint $t) => $t->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete());
            }
        }

        foreach ($null as $table) {
            if (! Schema::hasTable($table) || ! Schema::hasColumn($table, 'tenant_id')) {
                continue;
            }
            $fk = "{$table}_tenant_id_foreign";
            $this->dropForeignKeyIfExists($table, $fk);
            if (! $this->hasForeignKey($table, $fk)) {
                Schema::table($table, fn (Blueprint $t) => $t->foreign('tenant_id')->references('id')->on('tenants')->nullOnDelete());
            }
        }
    }
};
