<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use App\Models\InAppNotification;
use Illuminate\Console\Command;

class CheckExpiredSubscriptions extends Command
{
    protected $signature = 'subscriptions:check-expired';

    protected $description = 'Check for expired subscriptions and create notifications';

    public function handle(): int
    {
        $expiredSubscriptions = Subscription::where('status', 'active')
            ->where('trial_ends_at', '<', now())
            ->get();

        foreach ($expiredSubscriptions as $subscription) {
            $subscription->update(['status' => 'expired']);

            $tenant = $subscription->tenant;
            if ($tenant) {
                $owner = User::where('tenant_id', $tenant->id)->where('role', 'owner')->first();
                if ($owner) {
                    InAppNotification::create([
                        'user_id' => $owner->id,
                        'title' => 'Subscription Expired',
                        'message' => 'Your subscription has expired. Please renew to continue using all features.',
                        'type' => 'subscription',
                        'action_url' => route('subscription.index'),
                    ]);
                }
            }
        }

        $this->info("Checked {$expiredSubscriptions->count()} expired subscriptions.");

        return Command::SUCCESS;
    }
}
