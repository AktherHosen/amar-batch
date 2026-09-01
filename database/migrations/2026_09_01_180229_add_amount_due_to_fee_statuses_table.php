<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fee_statuses', function (Blueprint $table) {
            $table->decimal('amount_due', 10, 2)->default(0)->after('year');
        });

        DB::statement('
            UPDATE fee_statuses fs
            JOIN students s ON fs.student_id = s.id
            LEFT JOIN coaching_classes cc ON s.coaching_class_id = cc.id
            SET fs.amount_due = CASE
                WHEN s.joined_at IS NOT NULL
                    AND DAY(s.joined_at) > 15
                    AND MONTH(s.joined_at) = fs.month
                    AND YEAR(s.joined_at) = fs.year
                THEN ROUND(COALESCE(cc.default_fee, 0) / 2, 2)
                ELSE COALESCE(cc.default_fee, 0)
            END
        ');
    }

    public function down(): void
    {
        Schema::table('fee_statuses', function (Blueprint $table) {
            $table->dropColumn('amount_due');
        });
    }
};
