import { Head, router, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import PlanBadge from '@/components/plan-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useState } from 'react';
import { Check, Crown, Users, GraduationCap, Layers, ArrowRight, CreditCard } from 'lucide-react';
import { useLocale } from '@/contexts/locale-context';
import { index as subscriptionIndex } from '@/routes/subscription';

type Plan = {
    id: number;
    name: string;
    description: string | null;
    slug: string;
    price_monthly: number;
    price_yearly: number;
    max_students: number;
    max_staff: number;
    max_batches: number;
    features: string[] | null;
    is_default: boolean;
};

type Subscription = {
    id: number;
    status: string;
    billing_type: string | null;
    trial_ends_at: string | null;
    ends_at: string | null;
    plan: Plan | null;
};

type CurrentUsage = {
    students: number;
    staff: number;
    batches: number;
};

type PaymentRecord = {
    id: number;
    amount: number;
    status: string;
    billing_type: string;
    plan: string | null;
    paid_at: string | null;
};

type PageProps = {
    subscription: Subscription | null;
    plans: Plan[];
    currentUsage: CurrentUsage;
    recentPayments: PaymentRecord[];
};

const featureLabelKeys: Record<string, string> = {
    students: 'plan.feature_students',
    batches: 'plan.feature_batches',
    attendance: 'plan.feature_attendance',
    fees: 'plan.feature_fees',
    exams: 'plan.feature_exams',
    reports: 'plan.feature_reports',
    notifications: 'plan.feature_notifications',
    custom_branding: 'plan.feature_custom_branding',
    multi_branch: 'plan.feature_multi_branch',
    api_access: 'plan.feature_api_access',
};

export default function SubscriptionPage({ subscription, plans, currentUsage, recentPayments }: PageProps) {
    const { t, formatCurrency } = useLocale();
    const { flash } = usePage<{ flash: { error?: string; success?: string } }>().props;
    const [annual, setAnnual] = useState(true);
    const [upgradeDialog, setUpgradeDialog] = useState<{ open: boolean; plan: Plan | null; billing: string }>({
        open: false,
        plan: null,
        billing: 'yearly',
    });

    if (flash?.error) {
        toast.error(flash.error);
    }

    const currentPlan = subscription?.plan;
    const isTrial = subscription?.status === 'trial';
    const trialEndsAt = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
    const daysLeft = trialEndsAt ? Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

    const formatLimit = (value: number, type: 'students' | 'staff' | 'batches') => {
        if (value === -1) {
            const key = `plan.unlimited_${type}`;
            return t(key);
        }
        return value.toString();
    };

    const getUsagePercent = (current: number, max: number) => {
        if (max === -1) return 0;
        return Math.min(100, (current / max) * 100);
    };

    const handleUpgrade = (plan: Plan) => {
        if (plan.price_monthly > 0) {
            const billing = annual ? 'yearly' : 'monthly';
            submitPayment(plan.id, billing);
        } else {
            const billing = annual ? 'yearly' : 'monthly';
            setUpgradeDialog({ open: true, plan, billing });
        }
    };

    const confirmUpgrade = () => {
        if (!upgradeDialog.plan) return;

        if (upgradeDialog.plan.price_monthly > 0) {
            submitPayment(upgradeDialog.plan.id, upgradeDialog.billing);
        } else {
            router.post(`/subscription/upgrade/${upgradeDialog.plan.id}`, {}, {
                onSuccess: () => {
                    toast.success(t('toast.upgraded'));
                    setUpgradeDialog({ open: false, plan: null, billing: 'yearly' });
                },
            });
        }
    };

    const submitPayment = (planId: number, billing: string) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/payment/initiate/${planId}?billing=${billing}`;

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = '_token';
            input.value = csrfToken;
            form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success': return <Badge className="bg-green-600 text-white">{t('payment.status_success')}</Badge>;
            case 'failed': return <Badge className="bg-red-600 text-white">{t('payment.status_failed')}</Badge>;
            case 'pending': return <Badge variant="secondary">{t('payment.status_pending')}</Badge>;
            case 'cancelled': return <Badge variant="outline">{t('payment.status_cancelled')}</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <>
            <Head title={t('subscription.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    title={t('subscription.title')}
                    description={t('subscription.desc')}
                />

                {/* Current Plan Status */}
                {subscription && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Crown className="size-5" />
                                {t('subscription.current_plan')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-2xl font-bold">{currentPlan?.name || t('subscription.no_plan')}</h3>
                                        <Badge variant={isTrial ? 'secondary' : 'default'}>
                                            {isTrial ? t('subscription.trial') : subscription.status}
                                        </Badge>
                                        {subscription.billing_type && (
                                            <Badge variant="outline">{subscription.billing_type}</Badge>
                                        )}
                                    </div>
                                    {isTrial && daysLeft > 0 && (
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {t('subscription.trial_ends_in').replace('{days}', daysLeft.toString()).replace('{date}', trialEndsAt?.toLocaleDateString() || '')}
                                        </p>
                                    )}
                                    {subscription.ends_at && !isTrial && (
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {t('subscription.active_until')} {new Date(subscription.ends_at).toLocaleDateString()}
                                        </p>
                                    )}
                                    {currentPlan && (
                                        <p className="mt-2 text-2xl font-bold">
                                            {currentPlan.price_monthly === 0 ? t('plan.free') : formatCurrency(currentPlan.price_monthly) + '/' + t('plan.month')}
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
                                                {t('plan.students')}
                                            </span>
                                            <span className="font-medium">
                                                {currentUsage.students} / {formatLimit(currentPlan.max_students, 'students')}
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
                                                {t('plan.staff')}
                                            </span>
                                            <span className="font-medium">
                                                {currentUsage.staff} / {formatLimit(currentPlan.max_staff, 'staff')}
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
                                                {t('plan.batches')}
                                            </span>
                                            <span className="font-medium">
                                                {currentUsage.batches} / {formatLimit(currentPlan.max_batches, 'batches')}
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
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">{t('subscription.available_plans')}</h2>
                        <div className="flex items-center gap-3">
                            <span className={`text-sm ${!annual ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{t('plan.monthly')}</span>
                            <Switch checked={annual} onCheckedChange={setAnnual} />
                            <span className={`text-sm ${annual ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{t('plan.yearly')}</span>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {plans.map((plan) => {
                            const isCurrent = currentPlan?.id === plan.id;
                            const price = annual ? plan.price_yearly : plan.price_monthly;
                            const period = annual ? t('plan.year') : t('plan.month');

                            return (
                                <Card key={plan.id} className={`relative flex flex-col ${isCurrent ? 'border-primary' : ''}`}>
                                    <PlanBadge isCurrent={isCurrent} label={t('subscription.current_plan')} />
                                    <CardContent className="flex flex-1 flex-col pt-6">
                                        <h3 className="text-xl font-bold">{plan.name}</h3>
                                        {plan.description && (
                                            <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                                        )}

                                        <div className="mt-4">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-bold">
                                                    {price === 0 ? t('plan.free') : formatCurrency(price)}
                                                </span>
                                                {price > 0 && (
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                        /{period}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <Separator className="my-4" />

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">{t('plan.students')}</span>
                                                <span className="font-medium">{formatLimit(plan.max_students, 'students')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">{t('plan.staff')}</span>
                                                <span className="font-medium">{formatLimit(plan.max_staff, 'staff')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">{t('plan.batches')}</span>
                                                <span className="font-medium">{formatLimit(plan.max_batches, 'batches')}</span>
                                            </div>
                                        </div>

                                        {plan.features && plan.features.length > 0 && (
                                            <div className="mt-4 space-y-1">
                                                {plan.features.map((feature) => (
                                                    <div key={feature} className="flex items-center gap-1 text-sm">
                                                        <Check className="size-3 text-green-500" />
                                                        <span>{t(featureLabelKeys[feature] || feature)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-auto pt-4">
                                            {!isCurrent ? (
                                                <Button
                                                    className="w-full"
                                                    onClick={() => handleUpgrade(plan)}
                                                >
                                                    {currentPlan ? t('subscription.switch_plan') : t('subscription.get_started')}
                                                    <ArrowRight className="ml-2 size-4" />
                                                </Button>
                                            ) : (
                                                <Button className="w-full" variant="outline" disabled>
                                                    {t('subscription.current_plan')}
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Payments */}
                {recentPayments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="size-5" />
                                {t('payment.history')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentPayments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between rounded-lg border p-3">
                                        <div>
                                            <div className="font-medium">{payment.plan}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : '-'}
                                                {payment.billing_type && ` · ${payment.billing_type}`}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                                            {getStatusBadge(payment.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <ConfirmDialog
                open={upgradeDialog.open}
                onOpenChange={(open) => setUpgradeDialog({ ...upgradeDialog, open })}
                title={t('subscription.upgrade_title')}
                description={t('subscription.upgrade_desc').replace('{plan}', upgradeDialog.plan?.name || '')}
                confirmText={upgradeDialog.plan?.price_monthly ? t('subscription.proceed_to_payment') : t('subscription.switch_plan')}
                onConfirm={confirmUpgrade}
            />
        </>
    );
}

SubscriptionPage.layout = {
    breadcrumbs: [
        { title: 'Subscription', href: subscriptionIndex() },
    ],
};
