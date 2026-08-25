<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('code', 30)->after('id')->nullable();
        });

        // Backfill existing students with sequential codes per tenant
        $tenants = DB::table('students')
            ->select('tenant_id')
            ->distinct()
            ->pluck('tenant_id');

        foreach ($tenants as $tenantId) {
            $prefix = DB::table('tenants')
                ->where('id', $tenantId)
                ->value('student_id_prefix') ?? 'STD';

            $students = DB::table('students')
                ->where('tenant_id', $tenantId)
                ->orderBy('id')
                ->select('id')
                ->get();

            foreach ($students as $index => $student) {
                $code = $prefix . '-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT);
                DB::table('students')
                    ->where('id', $student->id)
                    ->update(['code' => $code]);
            }
        }

        Schema::table('students', function (Blueprint $table) {
            $table->unique(['tenant_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropUnique(['tenant_id', 'code']);
            $table->dropColumn('code');
        });
    }
};
