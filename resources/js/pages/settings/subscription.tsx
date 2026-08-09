import { Head, router, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { toast } from 'sonner';
import { useState } from 'react';
import { Check, Crown, Users, GraduationCap, Layers, ArrowRight } from 'lucide-react';

type Plan = {
    id: number;
    name: string;
    description: string | null;
    price_monthly: number;
    price_yearly: number;
    max_students: number;
    max_staff: number;
    max_batches: number;
    features: string[] | null;
};

type Subscription = {
    id: number;
    status: string;
    trial_ends_at: string | null;
    ends_at: string | null;
    plan: Plan | null;
};

type CurrentUsage = {
    students: number;
    staff: number;
    batches: number;
};

type PageProps = {
    subscription: Subscription | null;
    plans: Plan[];
    currentUsage: CurrentUsage;
};

export default function SubscriptionPage({ subscription, plans, currentUsage }: PageProps) {
    const [upgradeDialog, setUpgradeDialog] = useState<{ open: boolean; plan: Plan | null }>({
        open: false,
        plan: null,
    });

    const currentPlan = subscription?.plan;
    const isTrial = subscription?.status === 'trial';
    const trialEndsAt = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
    const daysLeft = trialEndsAt ? Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

    const formatLimit = (value: number) => (value === -1 ? 'Unlimited' : value.toString());

    const getUsagePercent = (current: number, max: number) => {
        if (max === -1) return 0;
        return Math.min(100, (current / max) * 100);
    };

    const handleUpgrade = (plan: Plan) => {
        setUpgradeDialog({ open: true, plan });
    };

    const confirmUpgrade = () => {
        if (upgradeDialog.plan) {
            router.post(`/subscription/upgrade/${upgradeDialog.plan.id}`, {}, {
                onSuccess: () => {
                    toast.success(`Upgraded to ${upgradeDialog.plan?.name} successfully!`);
                    setUpgradeDialog({ open: false, plan: null });
                },
            });
        }
    };

    return (
        <>
            <Head title="Subscription" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    title="Subscription & Plans"
                    description="Manage your subscription and view plan details"
                />

                {/* Current Plan Status */}
                {subscription && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Crown className="size-5" />
                                Current Plan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-2xl font-bold">{currentPlan?.name || 'No Plan'}</h3>
                                        <Badge variant={isTrial ? 'secondary' : 'default'}>
                                            {isTrial ? 'Trial' : subscription.status}
                                        </Badge>
                                    </div>
                                    {isTrial && daysLeft > 0 && (
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Trial ends in {daysLeft} days ({trialEndsAt?.toLocaleDateString()})
                                        </p>
                                    )}
                                    {currentPlan && (
                                        <p className="mt-2 text-2xl font-bold">
                                            {currentPlan.price_monthly === 0 ? 'Free' : `৳${currentPlan.price_monthly}/month`}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Current Usage */}
                            {currentPlan && (
                                <div className="mt-6 grid gap-4 md:grid-cols-3">
                                    <div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-1 text-muted-foreground">
                                                <GraduationCap className="size-4" />
                                                Students
                                            </span>
                                            <span className="font-medium">
                                                {currentUsage.students} / {formatLimit(currentPlan.max_students)}
                                            </span>
                                        </div>
                                        <div className="mt-1 h-2 rounded-full bg-secondary">
                                            <div
                                                className="h-2 rounded-full bg-primary"
                                                style={{ width: `${getUsagePercent(currentUsage.students, currentPlan.max_students)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-1 text-muted-foreground">
                                                <Users className="size-4" />
                                                Staff
                                            </span>
                                            <span className="font-medium">
                                                {currentUsage.staff} / {formatLimit(currentPlan.max_staff)}
                                            </span>
                                        </div>
                                        <div className="mt-1 h-2 rounded-full bg-secondary">
                                            <div
                                                className="h-2 rounded-full bg-primary"
                                                style={{ width: `${getUsagePercent(currentUsage.staff, currentPlan.max_staff)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-1 text-muted-foreground">
                                                <Layers className="size-4" />
                                                Batches
                                            </span>
                                            <span className="font-medium">
                                                {currentUsage.batches} / {formatLimit(currentPlan.max_batches)}
                                            </span>
                                        </div>
                                        <div className="mt-1 h-2 rounded-full bg-secondary">
                                            <div
                                                className="h-2 rounded-full bg-primary"
                                                style={{ width: `${getUsagePercent(currentUsage.batches, currentPlan.max_batches)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Available Plans */}
                <div>
                    <h2 className="mb-4 text-lg font-semibold">Available Plans</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {plans.map((plan) => {
                            const isCurrent = currentPlan?.id === plan.id;
                            return (
                                <Card key={plan.id} className={`relative ${isCurrent ? 'border-primary' : ''}`}>
                                    {isCurrent && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <Badge>Current Plan</Badge>
                                        </div>
                                    )}
                                    <CardContent className="pt-6">
                                        <h3 className="text-xl font-bold">{plan.name}</h3>
                                        {plan.description && (
                                            <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                                        )}

                                        <div className="mt-4">
                                            <div className="text-3xl font-bold">
                                                {plan.price_monthly === 0 ? 'Free' : `৳${plan.price_monthly}`}
                                            </div>
                                            {plan.price_monthly > 0 && (
                                                <p className="text-xs text-muted-foreground">
                                                    ৳{plan.price_yearly}/year (save {Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%)
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-4 space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Students</span>
                                                <span className="font-medium">{formatLimit(plan.max_students)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Staff</span>
                                                <span className="font-medium">{formatLimit(plan.max_staff)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Batches</span>
                                                <span className="font-medium">{formatLimit(plan.max_batches)}</span>
                                            </div>
                                        </div>

                                        {plan.features && plan.features.length > 0 && (
                                            <div className="mt-4 space-y-1">
                                                {plan.features.map((feature) => (
                                                    <div key={feature} className="flex items-center gap-1 text-sm">
                                                        <Check className="size-3 text-green-500" />
                                                        <span>{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {!isCurrent && (
                                            <Button
                                                className="mt-4 w-full"
                                                onClick={() => handleUpgrade(plan)}
                                            >
                                                {currentPlan ? 'Switch Plan' : 'Get Started'}
                                                <ArrowRight className="ml-2 size-4" />
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={upgradeDialog.open}
                onOpenChange={(open) => setUpgradeDialog({ open, plan: upgradeDialog.plan })}
                title="Upgrade Plan"
                description={`Are you sure you want to switch to "${upgradeDialog.plan?.name}"? Your current plan will be replaced immediately.`}
                confirmText="Switch Plan"
                onConfirm={confirmUpgrade}
            />
        </>
    );
}

SubscriptionPage.layout = {
    breadcrumbs: [
        { title: 'Subscription', href: '/subscription' },
    ],
};
