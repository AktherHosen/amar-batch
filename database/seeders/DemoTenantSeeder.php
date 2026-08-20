<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class DemoTenantSeeder extends Seeder
{
    public function run(): Tenant
    {
        $tenant = Tenant::create([
            'name' => 'Bright Minds Academy',
            'slug' => 'bright-minds',
            'email' => 'info@brightminds.com',
            'phone' => '+880 1712-345678',
            'is_active' => true,
        ]);

        $plan = Plan::where('is_default', true)->first();
        if ($plan) {
            Subscription::create([
                'tenant_id' => $tenant->id,
                'plan_id' => $plan->id,
                'status' => 'active',
            ]);
        }

        \App\Support\DefaultRoles::createForTenant($tenant->id);

        $this->command->info("Demo tenant created: {$tenant->name} (slug: {$tenant->slug})");

        return $tenant;
    }
}
