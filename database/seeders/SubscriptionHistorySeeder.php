<?php

namespace Database\Seeders;

use App\Models\Subscription;
use App\Models\SubscriptionHistory;
use Illuminate\Database\Seeder;

class SubscriptionHistorySeeder extends Seeder
{
    public function run(): void
    {
        Subscription::with('plan')->each(function (Subscription $sub) {
            SubscriptionHistory::create([
                'tenant_id' => $sub->tenant_id,
                'subscription_id' => $sub->id,
                'plan_id' => $sub->plan_id,
                'action' => $sub->status === 'trial' ? 'trial_started' : 'activated',
                'status' => $sub->status,
                'new_plan_name' => $sub->plan?->name,
                'created_at' => $sub->created_at,
            ]);
        });

        $this->command->info('Subscription history seeded.');
    }
}
