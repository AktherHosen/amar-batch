import { Head, router, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import PlanBadge from '@/components/plan-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/confirm-dialog';
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
    const isActive = subscription?.status === 'active';
    const trialEndsAt = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
    const daysLeft = trialEndsAt ? Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return t('students.active');
            case 'trial': return t('subscription.trial');
            case 'expired': return t('students.inactive');
            case 'cancelled': return t('payment.status_cancelled');
            default: return status;
        }
    };

    const formatLimit = (value: number, type: 'students' | 'staff' | 'batches') => {
        if (value === -1) {
            return <span className="text-lg leading-none">∞</span>;
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

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <Heading
                    title={t('subscription.title')}
                    description={t('subscription.desc')}
                />

                {/* Current Plan Status */}
                {subscription && (
                    <Card className="overflow-hidden border-primary/20">
                        <div className="relative bg-gradient-to-br from-primary/10 via-background to-background px-4 py-3.5 sm:px-6 sm:py-5">
                            <div className="relative flex flex-col gap-3 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 sm:size-14">
                                        <Crown className="size-6 sm:size-7" />
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
                                                {currentPlan?.name || t('subscription.no_plan')}
                                            </h3>
                                            {isTrial ? (
                                                <Badge variant="secondary">{t('subscription.trial')}</Badge>
                                            ) : (
                                                <Badge variant={isActive ? 'default' : 'destructive'}>
                                                    {getStatusLabel(subscription.status)}
                                                </Badge>
                                            )}
                                            {subscription.billing_type && (
                                                <Badge variant="outline" className="uppercase">
                                                    {t(`plan.${subscription.billing_type}`)}
                                                </Badge>
                                            )}
                                        </div>
                                        {isTrial && daysLeft > 0 && (
                                            <p className="mt-1.5 text-sm text-muted-foreground">
                                                {t('subscription.trial_ends_in').replace('{days}', daysLeft.toString()).replace('{date}', trialEndsAt?.toLocaleDateString() || '')}
                                            </p>
                                        )}
                                        {subscription.ends_at && !isTrial && (
                                            <p className="mt-1.5 text-sm text-muted-foreground">
                                                {t('subscription.active_until')} {new Date(subscription.ends_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {currentPlan && (
                                    <div className="flex items-center justify-between gap-2 lg:flex-col lg:items-end">
                                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground lg:mb-1">
                                            {t('payment.amount_paid')}
                                        </span>
                                        <span className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                                            {currentPlan.price_monthly === 0
                                                ? t('plan.free')
                                                : formatCurrency(subscription.billing_type === 'yearly'
                                                    ? currentPlan.price_yearly
                                                    : currentPlan.price_monthly) + '/'
                                                      + (subscription.billing_type === 'yearly'
                                                        ? t('plan.year')
                                                        : t('plan.month'))}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Current Usage */}
                        {currentPlan && (
                            <div className="border-t px-4 py-3.5 sm:px-6 sm:py-4">
                                <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    {t('plan.limits')}
                                </p>
                                <div className="grid gap-2.5 sm:grid-cols-3">
                                    <div className="rounded-lg border bg-card px-3 py-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                                <GraduationCap className="size-4" />
                                                {t('plan.students')}
                                            </span>
                                            <span className="font-semibold">
                                                {currentUsage.students} / {formatLimit(currentPlan.max_students, 'students')}
                                            </span>
                                        </div>
                                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                                            <div
                                                className={`h-full rounded-full transition-all ${getUsagePercent(currentUsage.students, currentPlan.max_students) >= 90 ? 'bg-destructive' : 'bg-primary'}`}
                                                style={{ width: `${getUsagePercent(currentUsage.students, currentPlan.max_students)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-lg border bg-card px-3 py-2.5">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                                <Users className="size-4" />
                                                {t('plan.staff')}
                                            </span>
                                            <span className="font-semibold">
                                                {currentUsage.staff} / {formatLimit(currentPlan.max_staff, 'staff')}
                                            </span>
                                        </div>
                                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                                            <div
                                                className={`h-full rounded-full transition-all ${getUsagePercent(currentUsage.staff, currentPlan.max_staff) >= 90 ? 'bg-destructive' : 'bg-primary'}`}
                                                style={{ width: `${getUsagePercent(currentUsage.staff, currentPlan.max_staff)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-lg border bg-card px-3 py-2.5">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                                <Layers className="size-4" />
                                                {t('plan.batches')}
                                            </span>
                                            <span className="font-semibold">
                                                {currentUsage.batches} / {formatLimit(currentPlan.max_batches, 'batches')}
                                            </span>
                                        </div>
                                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                                            <div
                                                className={`h-full rounded-full transition-all ${getUsagePercent(currentUsage.batches, currentPlan.max_batches) >= 90 ? 'bg-destructive' : 'bg-primary'}`}
                                                style={{ width: `${getUsagePercent(currentUsage.batches, currentPlan.max_batches)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                )}

                {/* Available Plans */}
                <div>
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-semibold">{t('subscription.available_plans')}</h2>
                        <div className="flex items-center gap-3 self-start rounded-full border bg-muted/40 p-1 sm:self-auto">
                            <button
                                type="button"
                                onClick={() => setAnnual(false)}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${!annual ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                            >
                                {t('plan.monthly')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setAnnual(true)}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${annual ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                            >
                                {t('plan.yearly')}
                            </button>
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {plans.map((plan) => {
                            const isCurrent = currentPlan?.id === plan.id;
                            const price = annual ? plan.price_yearly : plan.price_monthly;
                            const period = annual ? t('plan.year') : t('plan.month');
                            const isPopular = !isCurrent && plan.slug === 'pro';

                            return (
                                <Card
                                    key={plan.id}
                                    className={`relative flex flex-col transition-shadow hover:shadow-md ${isCurrent ? 'border-primary ring-1 ring-primary' : ''}`}
                                >
                                    <PlanBadge isCurrent={isCurrent} label={t('subscription.current_plan')} />
                                    <PlanBadge isPopular={isPopular} label={t('plan.popular')} />
                                    <CardContent className="flex flex-1 flex-col px-4 pt-8 sm:px-6">
                                        <h3 className="text-lg font-bold sm:text-xl">{plan.name}</h3>
                                        {plan.description && (
                                            <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{plan.description}</p>
                                        )}

                                        <div className="mt-4">
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-3xl font-bold tracking-tight sm:text-4xl">
                                                    {price === 0 ? t('plan.free') : formatCurrency(price)}
                                                </span>
                                                {price > 0 && (
                                                    <span className="text-sm text-muted-foreground whitespace-nowrap">
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
                                            <div className="mt-4 space-y-2">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                    {t('plan.includes')}
                                                </p>
                                                {plan.features.map((feature) => (
                                                    <div key={feature} className="flex items-center gap-2 text-sm">
                                                        <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                                                            <Check className="size-3 text-green-600" />
                                                        </span>
                                                        <span>{t(featureLabelKeys[feature] || feature)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-auto pt-5">
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
                        <CardHeader className="flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="size-5" />
                                {t('payment.history')}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {t('payment.history_desc')}
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {recentPayments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                <CreditCard className="size-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{payment.plan}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : '-'}
                                                    {payment.billing_type && ` · ${t(`plan.${payment.billing_type}`)}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                                            <span className="text-base font-semibold">{formatCurrency(payment.amount)}</span>
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
