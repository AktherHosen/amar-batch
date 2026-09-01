<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Copy existing tenant_id from users to the pivot table
        $users = DB::table('users')->whereNotNull('tenant_id')->select('id', 'tenant_id', 'role')->get();

        foreach ($users as $user) {
            DB::table('tenant_user')->insert([
                'tenant_id' => $user->tenant_id,
                'user_id' => $user->id,
                'role' => $user->role,
                'is_approved' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Drop tenant_id from users table (SQLite-safe approach)
        if (DB::getDriverName() !== 'sqlite') {
            $foreignKeys = Schema::getForeignKeys('users');
            foreach ($foreignKeys as $fk) {
                $fkName = is_array($fk) ? ($fk['name'] ?? '') : ($fk->name ?? '');
                if ($fkName === 'users_tenant_id_foreign') {
                    Schema::table('users', fn (Blueprint $t) => $t->dropForeign($fkName));
                    break;
                }
            }
        }

        if (Schema::hasColumn('users', 'tenant_id')) {
            Schema::table('users', fn (Blueprint $t) => $t->dropColumn('tenant_id'));
        }

        // Drop composite indexes that included tenant_id on users
        if (Schema::hasIndex('users', 'users_tenant_id_role_index')) {
            Schema::table('users', fn (Blueprint $t) => $t->dropIndex('users_tenant_id_role_index'));
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('tenant_id')->nullable()->after('id')->constrained()->nullOnDelete();
        });

        // Restore tenant_id from pivot
        $pivots = DB::table('tenant_user')
            ->whereIn('role', ['owner', 'staff', 'teacher', 'inactive'])
            ->select('user_id', 'tenant_id')
            ->get();

        foreach ($pivots as $pivot) {
            DB::table('users')->where('id', $pivot->user_id)->update(['tenant_id' => $pivot->tenant_id]);
        }

        Schema::dropIfExists('tenant_user');
    }
};
