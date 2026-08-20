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

    public function up(): void
    {
        $mysql = DB::getDriverName() !== 'sqlite';

        // --- Per-tenant unique constraints (were global) ---
        // MySQL needs an index covering roles.tenant_id (FK) to exist before the
        // old composite index can be dropped, so create the unique first.
        if (! Schema::hasIndex('roles', 'roles_tenant_id_slug_unique')) {
            Schema::table('roles', fn (Blueprint $t) => $t->unique(['tenant_id', 'slug']));
        }
        if (Schema::hasIndex('roles', 'roles_tenant_id_slug_index')) {
            Schema::table('roles', fn (Blueprint $t) => $t->dropIndex('roles_tenant_id_slug_index'));
        }
        if (Schema::hasIndex('roles', 'roles_slug_unique')) {
            Schema::table('roles', fn (Blueprint $t) => $t->dropUnique('roles_slug_unique'));
        }

        if (Schema::hasIndex('fee_receipts', 'fee_receipts_receipt_number_unique')) {
            Schema::table('fee_receipts', fn (Blueprint $t) => $t->dropUnique('fee_receipts_receipt_number_unique'));
        }
        if (! Schema::hasIndex('fee_receipts', 'fee_receipts_tenant_id_receipt_number_unique')) {
            Schema::table('fee_receipts', fn (Blueprint $t) => $t->unique(['tenant_id', 'receipt_number']));
        }

        if (Schema::hasIndex('students', 'students_email_unique')) {
            Schema::table('students', fn (Blueprint $t) => $t->dropUnique('students_email_unique'));
        }
        if (! Schema::hasIndex('students', 'students_tenant_id_email_unique')) {
            Schema::table('students', fn (Blueprint $t) => $t->unique(['tenant_id', 'email']));
        }

        // --- Dead column (bugs.MD #10) ---
        if (Schema::hasColumn('students', 'class_name')) {
            Schema::table('students', fn (Blueprint $t) => $t->dropColumn('class_name'));
        }

        // --- FK delete behaviors ---
        // SQLite cannot alter foreign keys; guard for local/test runs.
        if ($mysql) {
            foreach (['users', 'students', 'batches', 'teacher_batch', 'enrollments', 'fee_statuses', 'attendances', 'coaching_classes', 'batch_histories'] as $table) {
                $fk = "{$table}_tenant_id_foreign";
                if ($this->hasForeignKey($table, $fk)) {
                    Schema::table($table, fn (Blueprint $t) => $t->dropForeign($fk));
                }
                if (! $this->hasForeignKey($table, $fk)) {
                    Schema::table($table, fn (Blueprint $t) => $t->foreign('tenant_id')->references('id')->on('tenants')->restrictOnDelete());
                }
            }

            foreach (['fee_receipts', 'notices'] as $table) {
                $fk = "{$table}_created_by_foreign";
                Schema::table($table, fn (Blueprint $t) => $t->foreignId('created_by')->nullable()->change());
                if ($this->hasForeignKey($table, $fk)) {
                    Schema::table($table, fn (Blueprint $t) => $t->dropForeign($fk));
                }
                if (! $this->hasForeignKey($table, $fk)) {
                    Schema::table($table, fn (Blueprint $t) => $t->foreign('created_by')->references('id')->on('users')->nullOnDelete());
                }
            }

            foreach (['exams', 'notices'] as $table) {
                $fk = "{$table}_batch_id_foreign";
                if ($this->hasForeignKey($table, $fk)) {
                    Schema::table($table, fn (Blueprint $t) => $t->dropForeign($fk));
                }
                if (! $this->hasForeignKey($table, $fk)) {
                    Schema::table($table, fn (Blueprint $t) => $t->foreign('batch_id')->references('id')->on('batches')->cascadeOnDelete());
                }
            }
        }

        // --- Redundant index (unique already covers txid) ---
        if (Schema::hasIndex('payments', 'payments_txid_index')) {
            Schema::table('payments', fn (Blueprint $t) => $t->dropIndex('payments_txid_index'));
        }

        // --- Missing column ---
        if (! Schema::hasColumn('fee_receipts', 'payment_method')) {
            Schema::table('fee_receipts', fn (Blueprint $t) => $t->string('payment_method')->nullable()->after('amount_due'));
        }

        // --- Composite indexes for hot query paths ---
        $compositeIndexes = [
            'attendances' => [['tenant_id', 'date', 'status'], ['tenant_id', 'student_id', 'batch_id', 'date']],
            'fee_statuses' => [['tenant_id', 'month', 'year'], ['tenant_id', 'batch_id', 'month', 'year']],
            'students' => [['tenant_id', 'status'], ['coaching_class_id']],
            'batches' => [['tenant_id', 'status']],
            'enrollments' => [['tenant_id', 'status'], ['batch_id', 'status']],
            'users' => [['tenant_id', 'role']],
        ];

        foreach ($compositeIndexes as $table => $indexes) {
            foreach ($indexes as $cols) {
                $name = "{$table}_".implode('_', $cols).'_index';
                if (! Schema::hasIndex($table, $name)) {
                    Schema::table($table, fn (Blueprint $t) => $t->index($cols));
                }
            }
        }

        foreach (['exams', 'exam_results', 'branches', 'holidays', 'notices'] as $table) {
            $name = "{$table}_tenant_id_index";
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'tenant_id') && ! Schema::hasIndex($table, $name)) {
                Schema::table($table, fn (Blueprint $t) => $t->index('tenant_id', $name));
            }
        }
    }

    public function down(): void
    {
        // Indexes: drop the composites added above.
        $drop = [
            'attendances' => ['attendances_tenant_id_date_status_index', 'attendances_tenant_id_student_id_batch_id_date_index'],
            'fee_statuses' => ['fee_statuses_tenant_id_month_year_index', 'fee_statuses_tenant_id_batch_id_month_year_index'],
            'students' => ['students_tenant_id_status_index', 'students_coaching_class_id_index'],
            'batches' => ['batches_tenant_id_status_index'],
            'enrollments' => ['enrollments_tenant_id_status_index', 'enrollments_batch_id_status_index'],
            'users' => ['users_tenant_id_role_index'],
        ];

        foreach ($drop as $table => $indexes) {
            foreach ($indexes as $name) {
                if (Schema::hasIndex($table, $name)) {
                    Schema::table($table, fn (Blueprint $t) => $t->dropIndex($name));
                }
            }
        }

        foreach (['exams', 'exam_results', 'branches', 'holidays', 'notices'] as $table) {
            $name = "{$table}_tenant_id_index";
            if (Schema::hasTable($table) && Schema::hasIndex($table, $name)) {
                Schema::table($table, fn (Blueprint $t) => $t->dropIndex($name));
            }
        }

        // Uniques back to global.
        if (Schema::hasIndex('roles', 'roles_tenant_id_slug_unique')) {
            Schema::table('roles', function (Blueprint $t) {
                $t->dropUnique('roles_tenant_id_slug_unique');
                $t->unique('slug');
            });
        }
        if (Schema::hasIndex('fee_receipts', 'fee_receipts_tenant_id_receipt_number_unique')) {
            Schema::table('fee_receipts', function (Blueprint $t) {
                $t->dropUnique('fee_receipts_tenant_id_receipt_number_unique');
                $t->unique('receipt_number');
            });
        }
        if (Schema::hasIndex('students', 'students_tenant_id_email_unique')) {
            Schema::table('students', function (Blueprint $t) {
                $t->dropUnique('students_tenant_id_email_unique');
                $t->unique('email');
            });
        }
    }
};
