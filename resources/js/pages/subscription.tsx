import Heading from '@/components/heading';
import PlanCard from '@/components/plan-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/contexts/locale-context';
import { index as subscriptionIndex } from '@/routes/subscription';
import { Head, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Banknote,
    CreditCard,
    Crown,
    GraduationCap,
    Layers,
    Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

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
    manualPaymentEnabled: boolean;
    manualPaymentInstructions: string | null;
    onlinePaymentEnabled: boolean;
    availableFeatures: string[];
    featureMap: Record<string, string>;
};

function InstructionsWithCopy({ html }: { html: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        if (!ref.current) return;
        const codes = ref.current.querySelectorAll('code');
        codes.forEach((code) => {
            const text = code.textContent?.trim() || '';
            if (!/^\d{10,11}$/.test(text)) return;

            const wrapper = document.createElement('span');
            wrapper.style.cssText = 'display:inline-flex;align-items:center;gap:4px;';

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.setAttribute('data-copy', text);
            btn.className = 'inline-flex items-center justify-center size-5 rounded bg-muted hover:bg-muted/80 transition-colors';
            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
            btn.title = 'Copy number';
            btn.addEventListener('click', async () => {
                await navigator.clipboard.writeText(text);
                setCopiedId(text);
                btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
                setTimeout(() => {
                    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
                    setCopiedId(null);
                }, 1500);
            });

            code.parentNode?.insertBefore(wrapper, code);
            wrapper.appendChild(code);
            wrapper.appendChild(btn);
        });
    }, [html]);

    return (
        <div
            ref={ref}
            className="rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground prose dark:prose-invert max-w-none break-words overflow-hidden [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-foreground [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:italic [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_p]:whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

export default function SubscriptionPage({
    subscription,
    plans,
    currentUsage,
    recentPayments,
    manualPaymentEnabled,
    manualPaymentInstructions,
    onlinePaymentEnabled,
    availableFeatures,
    featureMap,
}: PageProps) {
    const { t, formatCurrency } = useLocale();
    const { flash } = usePage<{ flash: { error?: string; success?: string } }>()
        .props;
    const [annual, setAnnual] = useState(true);
    const [upgradeDialog, setUpgradeDialog] = useState<{
        open: boolean;
        plan: Plan | null;
        billing: string;
    }>({
        open: false,
        plan: null,
        billing: 'yearly',
    });
    const [manualDialog, setManualDialog] = useState<{
        open: boolean;
        plan: Plan | null;
        billing: string;
    }>({
        open: false,
        plan: null,
        billing: 'monthly',
    });
    const [manualForm, setManualForm] = useState({
        transaction_id: '',
        sender_number: '',
        notes: '',
    });
    const [manualProcessing, setManualProcessing] = useState(false);

    if (flash?.error) {
        toast.error(flash.error);
    }

    const currentPlan = subscription?.plan;
    const isTrial = subscription?.status === 'trial';
    const isActive = subscription?.status === 'active';
    const trialEndsAt = subscription?.trial_ends_at
        ? new Date(subscription.trial_ends_at)
        : null;
    const daysLeft = trialEndsAt
        ? Math.ceil(
              (trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
          )
        : 0;

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active':
                return t('students.active');
            case 'trial':
                return t('subscription.trial');
            case 'past_due':
                return t('subscription.past_due');
            case 'expired':
                return t('students.inactive');
            case 'cancelled':
                return t('payment.status_cancelled');
            default:
                return status;
        }
    };

    const formatLimit = (value: number) => {
        if (value === -1) {
            return <span className="text-lg leading-none">∞</span>;
        }

        return value.toString();
    };

    const getUsagePercent = (current: number, max: number) => {
        if (max === -1) {
            return 0;
        }

        return Math.min(100, (current / max) * 100);
    };

    const handleUpgrade = (plan: Plan) => {
        const billing = annual ? 'yearly' : 'monthly';

        if (plan.price_monthly > 0) {
            if (manualPaymentEnabled) {
                setUpgradeDialog({ open: true, plan, billing });
            } else {
                submitPayment(plan.id, billing);
            }
        } else {
            setUpgradeDialog({ open: true, plan, billing });
        }
    };

    const submitPayment = (planId: number, billing: string) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/payment/initiate/${planId}?billing=${billing}`;

        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');

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

    const submitManualPayment = () => {
        if (!manualDialog.plan || !manualForm.transaction_id.trim()) {
            return;
        }

        setManualProcessing(true);

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/payment/manual/${manualDialog.plan.id}?billing=${manualDialog.billing}`;

        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');

        if (csrfToken) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = '_token';
            input.value = csrfToken;
            form.appendChild(input);
        }

        const txInput = document.createElement('input');
        txInput.type = 'hidden';
        txInput.name = 'transaction_id';
        txInput.value = manualForm.transaction_id;
        form.appendChild(txInput);

        if (manualForm.sender_number) {
            const senderInput = document.createElement('input');
            senderInput.type = 'hidden';
            senderInput.name = 'sender_number';
            senderInput.value = manualForm.sender_number;
            form.appendChild(senderInput);
        }

        if (manualForm.notes) {
            const notesInput = document.createElement('input');
            notesInput.type = 'hidden';
            notesInput.name = 'notes';
            notesInput.value = manualForm.notes;
            form.appendChild(notesInput);
        }

        document.body.appendChild(form);
        form.submit();
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return (
                    <Badge className="bg-green-600 text-white">
                        {t('payment.status_success')}
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge className="bg-red-600 text-white">
                        {t('payment.status_failed')}
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="secondary">
                        {t('payment.status_pending')}
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge variant="outline">
                        {t('payment.status_cancelled')}
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <>
            <Head title={t('subscription.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-3 sm:gap-6 sm:p-4">
                <Heading
                    title={t('subscription.title')}
                    description={t('subscription.desc')}
                />

                {/* Current Plan Status */}
                {subscription && (
                    <Card className="overflow-hidden border-primary/20">
                        <div className="relative bg-gradient-to-br from-primary/10 via-background to-background px-3 py-3 sm:px-6 sm:py-5">
                            <div className="relative flex flex-col gap-3 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-center gap-2.5 sm:gap-4">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 sm:size-14">
                                        <Crown className="size-5 sm:size-7" />
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                            <h3 className="text-lg font-bold tracking-tight sm:text-2xl">
                                                {currentPlan?.name ||
                                                    t('subscription.no_plan')}
                                            </h3>
                                            {isTrial ? (
                                                <Badge variant="secondary">
                                                    {t('subscription.trial')}
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant={
                                                        isActive
                                                            ? 'default'
                                                            : 'destructive'
                                                    }
                                                >
                                                    {getStatusLabel(
                                                        subscription.status,
                                                    )}
                                                </Badge>
                                            )}
                                            {subscription.billing_type && (
                                                <Badge
                                                    variant="outline"
                                                    className="uppercase"
                                                >
                                                    {t(
                                                        `plan.${subscription.billing_type}`,
                                                    )}
                                                </Badge>
                                            )}
                                        </div>
                                        {isTrial && daysLeft > 0 && (
                                            <p className="mt-1.5 text-sm text-muted-foreground">
                                                {t('subscription.trial_ends_in')
                                                    .replace(
                                                        '{days}',
                                                        daysLeft.toString(),
                                                    )
                                                    .replace(
                                                        '{date}',
                                                        trialEndsAt?.toLocaleDateString() ||
                                                            '',
                                                    )}
                                            </p>
                                        )}
                                        {subscription.ends_at && !isTrial && (
                                            <p className="mt-1.5 text-sm text-muted-foreground">
                                                {t('subscription.active_until')}{' '}
                                                {new Date(
                                                    subscription.ends_at,
                                                ).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {currentPlan && (
                                    <div className="flex items-center justify-between gap-2 lg:flex-col lg:items-end">
                                        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase lg:mb-1">
                                            {t('payment.amount_paid')}
                                        </span>
                                        <span className="text-xl font-bold tracking-tight text-primary sm:text-3xl">
                                            {currentPlan.price_monthly === 0
                                                ? t('plan.free')
                                                : formatCurrency(
                                                      subscription.billing_type ===
                                                          'yearly'
                                                          ? currentPlan.price_yearly
                                                          : currentPlan.price_monthly,
                                                  ) +
                                                  '/' +
                                                  (subscription.billing_type ===
                                                  'yearly'
                                                      ? t('plan.year')
                                                      : t('plan.month'))}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Current Usage */}
                        {currentPlan && (
                            <div className="border-t px-3 py-3 sm:px-6 sm:py-4">
                                <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    {t('plan.limits')}
                                </p>
                                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2.5">
                                    <div className="rounded-lg border bg-card px-3 py-2 sm:min-w-[200px] sm:flex-1">
                                        <div className="flex items-center justify-between text-xs sm:text-sm">
                                            <span className="flex items-center gap-1 text-muted-foreground sm:gap-1.5">
                                                <GraduationCap className="size-3.5 sm:size-4" />
                                                {t('plan.students')}
                                            </span>
                                            <span className="font-semibold">
                                                {currentUsage.students} /{' '}
                                                {formatLimit(
                                                    currentPlan.max_students,
                                                )}
                                            </span>
                                        </div>
                                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                                            <div
                                                className={`h-full rounded-full transition-all ${getUsagePercent(currentUsage.students, currentPlan.max_students) >= 90 ? 'bg-destructive' : 'bg-primary'}`}
                                                style={{
                                                    width: `${getUsagePercent(currentUsage.students, currentPlan.max_students)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-lg border bg-card px-3 py-2 sm:min-w-[200px] sm:flex-1">
                                        <div className="flex items-center justify-between text-xs sm:text-sm">
                                            <span className="flex items-center gap-1 text-muted-foreground sm:gap-1.5">
                                                <Users className="size-3.5 sm:size-4" />
                                                {t('plan.staff')}
                                            </span>
                                            <span className="font-semibold">
                                                {currentUsage.staff} /{' '}
                                                {formatLimit(
                                                    currentPlan.max_staff,
                                                )}
                                            </span>
                                        </div>
                                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                                            <div
                                                className={`h-full rounded-full transition-all ${getUsagePercent(currentUsage.staff, currentPlan.max_staff) >= 90 ? 'bg-destructive' : 'bg-primary'}`}
                                                style={{
                                                    width: `${getUsagePercent(currentUsage.staff, currentPlan.max_staff)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-lg border bg-card px-3 py-2 sm:min-w-[200px] sm:flex-1">
                                        <div className="flex items-center justify-between text-xs sm:text-sm">
                                            <span className="flex items-center gap-1 text-muted-foreground sm:gap-1.5">
                                                <Layers className="size-3.5 sm:size-4" />
                                                {t('plan.batches')}
                                            </span>
                                            <span className="font-semibold">
                                                {currentUsage.batches} /{' '}
                                                {formatLimit(
                                                    currentPlan.max_batches,
                                                )}
                                            </span>
                                        </div>
                                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                                            <div
                                                className={`h-full rounded-full transition-all ${getUsagePercent(currentUsage.batches, currentPlan.max_batches) >= 90 ? 'bg-destructive' : 'bg-primary'}`}
                                                style={{
                                                    width: `${getUsagePercent(currentUsage.batches, currentPlan.max_batches)}%`,
                                                }}
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
                        <h2 className="text-sm font-semibold sm:text-lg">
                            {t('subscription.available_plans')}
                        </h2>
                        <div className="flex items-center gap-3 self-start rounded-full border bg-muted/40 p-1 sm:self-auto">
                            <button
                                type="button"
                                onClick={() => setAnnual(false)}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors sm:px-4 sm:py-1.5 sm:text-sm ${!annual ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                            >
                                {t('plan.monthly')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setAnnual(true)}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors sm:px-4 sm:py-1.5 sm:text-sm ${annual ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                            >
                                {t('plan.yearly')}
                            </button>
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                        {plans.map((plan) => {
                            const isCurrent = currentPlan?.id === plan.id;
                            const isPopular = !isCurrent && plan.slug === 'pro';

                            return (
                                <PlanCard
                                    key={plan.id}
                                    plan={plan}
                                    annual={annual}
                                    isCurrent={isCurrent}
                                    isPopular={isPopular}
                                    currentLabel={t(
                                        'subscription.current_plan',
                                    )}
                                    popularLabel={t('plan.popular')}
                                    availableFeatures={availableFeatures}
                                    featureMap={featureMap}
                                    cta={
                                        !isCurrent ? (
                                            <Button
                                                className="w-full"
                                                onClick={() =>
                                                    handleUpgrade(plan)
                                                }
                                            >
                                                {currentPlan
                                                    ? t(
                                                          'subscription.switch_plan',
                                                      )
                                                    : t(
                                                          'subscription.get_started',
                                                      )}
                                                <ArrowRight className="ml-2 size-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                className="w-full"
                                                variant="outline"
                                                disabled
                                            >
                                                {t('subscription.current_plan')}
                                            </Button>
                                        )
                                    }
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Recent Payments */}
                {recentPayments.length > 0 && (
                    <Card>
                        <CardHeader className="flex-col items-start gap-1 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:p-6">
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="size-5" />
                                {t('payment.history')}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground sm:text-sm">
                                {t('payment.history_desc')}
                            </p>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-2">
                                {recentPayments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                                    >
                                        <div className="flex items-center gap-2.5 sm:gap-3">
                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted sm:size-10">
                                                <CreditCard className="size-4 text-muted-foreground sm:size-5" />
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {payment.plan}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {payment.paid_at
                                                        ? new Date(
                                                              payment.paid_at,
                                                          ).toLocaleDateString()
                                                        : '-'}
                                                    {payment.billing_type &&
                                                        ` · ${t(`plan.${payment.billing_type}`)}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                                            <span className="text-sm font-semibold sm:text-base">
                                                {formatCurrency(payment.amount)}
                                            </span>
                                            {getStatusBadge(payment.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Dialog
                open={upgradeDialog.open}
                onOpenChange={(open) =>
                    setUpgradeDialog({ ...upgradeDialog, open })
                }
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {t('subscription.upgrade_title')}
                        </DialogTitle>
                        <DialogDescription>
                            {upgradeDialog.plan
                                ? t('subscription.upgrade_desc').replace(
                                      '{plan}',
                                      upgradeDialog.plan.name,
                                  )
                                : ''}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        {onlinePaymentEnabled && (
                            <Button
                                className="w-full justify-start gap-3"
                                variant="outline"
                                onClick={() => {
                                    setUpgradeDialog({
                                        ...upgradeDialog,
                                        open: false,
                                    });
                                    submitPayment(
                                        upgradeDialog.plan!.id,
                                        upgradeDialog.billing,
                                    );
                                }}
                            >
                                <CreditCard className="size-4" />
                                {t('subscription.pay_with_gateway')}
                            </Button>
                        )}
                        {manualPaymentEnabled && (
                            <Button
                                className="w-full justify-start gap-3"
                                variant="outline"
                                onClick={() => {
                                    setUpgradeDialog({
                                        ...upgradeDialog,
                                        open: false,
                                    });
                                    setManualDialog({
                                        open: true,
                                        plan: upgradeDialog.plan,
                                        billing: upgradeDialog.billing,
                                    });
                                }}
                            >
                                <Banknote className="size-4" />
                                {t('subscription.pay_manually')}
                            </Button>
                        )}
                        {!onlinePaymentEnabled && !manualPaymentEnabled && (
                            <p className="text-center text-sm text-muted-foreground">
                                {t('subscription.no_payment_methods')}
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={manualDialog.open}
                onOpenChange={(open) =>
                    setManualDialog({ ...manualDialog, open })
                }
            >
                <DialogContent className="sm:max-w-2xl w-full shrink">
                    <DialogHeader>
                        <DialogTitle>
                            {t('subscription.manual_payment_title')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('subscription.manual_payment_desc')}
                        </DialogDescription>
                    </DialogHeader>
                    {manualPaymentInstructions && (
                        <InstructionsWithCopy html={manualPaymentInstructions} />
                    )}
                    <div className="space-y-3">
                        <div className="grid gap-2">
                            <Label htmlFor="manual_tx_id">
                                {t('subscription.transaction_id')}
                            </Label>
                            <Input
                                id="manual_tx_id"
                                value={manualForm.transaction_id}
                                onChange={(e) =>
                                    setManualForm({
                                        ...manualForm,
                                        transaction_id: e.target.value,
                                    })
                                }
                                placeholder={t(
                                    'subscription.transaction_id_placeholder',
                                )}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="manual_sender">
                                {t('subscription.sender_number')}
                            </Label>
                            <Input
                                id="manual_sender"
                                value={manualForm.sender_number}
                                onChange={(e) =>
                                    setManualForm({
                                        ...manualForm,
                                        sender_number: e.target.value,
                                    })
                                }
                                placeholder={t(
                                    'subscription.sender_number_placeholder',
                                )}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="manual_notes">
                                {t('subscription.notes')}
                            </Label>
                            <Textarea
                                id="manual_notes"
                                value={manualForm.notes}
                                onChange={(e) =>
                                    setManualForm({
                                        ...manualForm,
                                        notes: e.target.value,
                                    })
                                }
                                placeholder={t(
                                    'subscription.notes_placeholder',
                                )}
                                rows={2}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() =>
                                setManualDialog({
                                    ...manualDialog,
                                    open: false,
                                })
                            }
                        >
                            {t('actions.cancel')}
                        </Button>
                        <Button
                            onClick={submitManualPayment}
                            disabled={
                                manualProcessing ||
                                !manualForm.transaction_id.trim()
                            }
                        >
                            {manualProcessing
                                ? t('actions.saving')
                                : t('subscription.submit_manual_payment')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

SubscriptionPage.layout = {
    breadcrumbs: [{ title: 'Subscription', href: subscriptionIndex() }],
};
