<?php

namespace App\Support;

use App\Models\Role;

class DefaultRoles
{
    /** Seed the configured system roles for a tenant (idempotent). */
    public static function createForTenant(int $tenantId): void
    {
        foreach (config('role-routes.system_roles', []) as $role) {
            Role::query()
                ->where('tenant_id', $tenantId)
                ->where('slug', $role['slug'])
                ->firstOrCreate(
                    ['tenant_id' => $tenantId, 'slug' => $role['slug']],
                    $role,
                );
        }
    }

    /** Backfill default roles for all existing tenants. */
    public static function backfillAll(): void
    {
        foreach (\App\Models\Tenant::all() as $tenant) {
            self::createForTenant($tenant->id);
        }
    }
}