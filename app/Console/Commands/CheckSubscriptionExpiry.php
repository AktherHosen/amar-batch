<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use Illuminate\Console\Command;

class CheckSubscriptionExpiry extends Command
{
    protected $signature = 'subscriptions:check-expiry';

    protected $description = 'Check and update expired trial/paid subscriptions';

    public function handle(): int
    {
        $expiredTrials = Subscription::where('status', 'trial')
            ->where('trial_ends_at', '<=', now())
            ->update(['status' => 'past_due']);

        $expiredPaid = Subscription::where('status', 'active')
            ->where('ends_at', '<=', now())
            ->where('ends_at', '!=', null)
            ->update(['status' => 'past_due']);

        $this->info("Updated {$expiredTrials} expired trials to past_due.");
        $this->info("Updated {$expiredPaid} expired paid subscriptions to past_due.");

        return self::SUCCESS;
    }
}
