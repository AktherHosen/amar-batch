<?php

namespace App\Console\Commands;

use App\Models\InAppNotification;
use App\Models\Subscription;
use App\Models\SubscriptionHistory;
use App\Models\User;
use Illuminate\Console\Command;

class CheckSubscriptionExpiry extends Command
{
    protected $signature = 'subscriptions:check-expiry';

    protected $description = 'Check and update expired trial/paid subscriptions, send notifications';

    public function handle(): int
    {
        $this->expireTrials();
        $this->expirePaidSubscriptions();
        $this->sendExpiryWarnings();

        return self::SUCCESS;
    }

    protected function expireTrials(): void
    {
        $expiredTrials = Subscription::where('status', 'trial')
            ->where('trial_ends_at', '<=', now())
            ->get();

        $freePlan = \App\Models\Plan::where('slug', 'free-trial')->first();

        foreach ($expiredTrials as $subscription) {
            if ($freePlan) {
                $subscription->update([
                    'plan_id' => $freePlan->id,
                    'status' => 'active',
                    'trial_ends_at' => null,
                ]);

                SubscriptionHistory::create([
                    'tenant_id' => $subscription->tenant_id,
                    'subscription_id' => $subscription->id,
                    'plan_id' => $freePlan->id,
                    'action' => 'downgraded',
                    'status' => 'active',
                    'old_plan_name' => $subscription->plan?->name,
                    'new_plan_name' => $freePlan->name,
                ]);

                $this->notifyOwner($subscription, 'Trial Ended', 'Your Pro trial has ended. Your account has been migrated to the Free plan.');
            } else {
                $subscription->update(['status' => 'past_due']);

                SubscriptionHistory::create([
                    'tenant_id' => $subscription->tenant_id,
                    'subscription_id' => $subscription->id,
                    'plan_id' => $subscription->plan_id,
                    'action' => 'trial_ended',
                    'status' => 'past_due',
                    'old_plan_name' => $subscription->plan?->name,
                    'new_plan_name' => $subscription->plan?->name,
                ]);

                $this->notifyOwner($subscription, 'Trial Expired', 'Your free trial has expired. Please subscribe to a plan to continue using all features.');
            }
        }

        $this->info("Updated {$expiredTrials->count()} expired trials.");
    }

    protected function expirePaidSubscriptions(): void
    {
        $expiredPaid = Subscription::where('status', 'active')
            ->where('ends_at', '!=', null)
            ->where('ends_at', '<=', now())
            ->get();

        foreach ($expiredPaid as $subscription) {
            $subscription->update(['status' => 'past_due']);

            SubscriptionHistory::create([
                'tenant_id' => $subscription->tenant_id,
                'subscription_id' => $subscription->id,
                'plan_id' => $subscription->plan_id,
                'action' => 'expired',
                'status' => 'past_due',
                'old_plan_name' => $subscription->plan?->name,
                'new_plan_name' => $subscription->plan?->name,
            ]);

            $this->notifyOwner($subscription, 'Subscription Expired', 'Your subscription has expired. Please renew to continue using all features.');
        }

        $this->info("Updated {$expiredPaid->count()} expired paid subscriptions to past_due.");
    }

    protected function sendExpiryWarnings(): void
    {
        $warningDate = now()->addDays(3);

        $expiringTrials = Subscription::where('status', 'trial')
            ->where('trial_ends_at', '>', now())
            ->where('trial_ends_at', '<=', $warningDate)
            ->get();

        foreach ($expiringTrials as $subscription) {
            $daysLeft = (int) now()->diffInDays($subscription->trial_ends_at, false);
            if ($daysLeft > 0 && ! $this->hasRecentWarning($subscription->tenant_id, 'trial')) {
                $this->notifyOwner(
                    $subscription,
                    'Trial Expiring Soon',
                    "Your free trial expires in {$daysLeft} day(s). Subscribe to a plan to avoid interruption."
                );
            }
        }

        $expiringPaid = Subscription::where('status', 'active')
            ->where('ends_at', '!=', null)
            ->where('ends_at', '>', now())
            ->where('ends_at', '<=', $warningDate)
            ->get();

        foreach ($expiringPaid as $subscription) {
            $daysLeft = (int) now()->diffInDays($subscription->ends_at, false);
            if ($daysLeft > 0 && ! $this->hasRecentWarning($subscription->tenant_id, 'subscription')) {
                $this->notifyOwner(
                    $subscription,
                    'Subscription Expiring Soon',
                    "Your subscription expires in {$daysLeft} day(s). Renew now to avoid interruption."
                );
            }
        }
    }

    protected function notifyOwner(Subscription $subscription, string $title, string $message): void
    {
        $owner = User::whereHas('tenants', fn ($q) => $q->where('tenants.id', $subscription->tenant_id))
            ->where('role', 'owner')
            ->first();

        if ($owner) {
            InAppNotification::create([
                'tenant_id' => $subscription->tenant_id,
                'user_id' => $owner->id,
                'title' => $title,
                'message' => $message,
                'type' => 'subscription',
                'action_url' => route('subscription.index'),
            ]);
        }
    }

    protected function hasRecentWarning(int $tenantId, string $type): bool
    {
        return InAppNotification::where('tenant_id', $tenantId)
            ->where('type', 'subscription')
            ->where('title', 'like', "%{$type}%")
            ->where('created_at', '>=', now()->subDay())
            ->exists();
    }
}
