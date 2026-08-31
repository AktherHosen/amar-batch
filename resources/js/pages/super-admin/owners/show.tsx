import { Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CreditCard,
    Check,
    History,
    ArrowUpCircle,
    ArrowDownCircle,
    RotateCcw,
    PlayCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useLocale } from '@/contexts/locale-context';

type Owner = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    created_at: string;
    tenant: {
        id: number;
        name: string;
        slug: string;
        email: string | null;
        phone: string | null;
        is_active: boolean;
        subscription: {
            id: number;
            status: string;
            billing_type: string | null;
            trial_ends_at: string | null;
            ends_at: string | null;
            plan: {
                id: number;
                name: string;
                price_monthly: number;
                price_yearly: number;
                max_students: number;
                max_staff: number;
                max_batches: number;
                features: string[];
            } | null;
        } | null;
    } | null;
};

type Plan = {
    id: number;
    name: string;
    price_monthly: number;
    price_yearly: number;
    max_students: number;
    max_staff: number;
    max_batches: number;
    features: string[];
};

type HistoryRecord = {
    id: number;
    action: string;
    status: string;
    billing_type: string | null;
    amount: number | null;
    old_plan_name: string | null;
    new_plan_name: string | null;
    plan_name: string | null;
    created_at: string;
};

type PageProps = {
    owner: Owner;
    plans: Plan[];
    history: HistoryRecord[];
};

export default function OwnerShow({ owner, plans, history }: PageProps) {
    const { formatCurrency, t } = useLocale();
    const [planDialog, setPlanDialog] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState(
        String(owner.tenant?.subscription?.plan?.id || '')
    );

    const tenant = owner.tenant;
    const subscription = tenant?.subscription;
    const currentPlan = subscription?.plan;

    const handleAssignPlan = () => {
        if (!selectedPlanId) {
return;
}

        router.post(`/dashboard/owners/${owner.id}/assign-plan`, {
            plan_id: Number(selectedPlanId),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('toast.updated_successfully'));
                setPlanDialog(false);
            },
        });
    };

    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-3 sm:p-4">
                <div className="flex items-start gap-3">
                    <Button variant="ghost" size="icon" className="size-9 shrink-0" onClick={() => window.history.back()}>
                        <ArrowLeft className="size-4" />
                    </Button>
                    <Heading
                        title={owner.name}
                        description={owner.email}
                    />
                    <div className="ml-auto flex items-center gap-2">
                        <Badge variant={owner.role === 'owner' ? 'default' : 'destructive'}>
                            {owner.role === 'owner' ? t('super_admin.active') : t('super_admin.inactive')}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">{t('super_admin.coaching_centers')}</CardTitle>
                            <Building2 className="size-3.5 text-muted-foreground sm:size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-base font-bold sm:text-lg">{tenant?.name || '—'}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">{t('super_admin.plan_name')}</CardTitle>
                            <CreditCard className="size-3.5 text-muted-foreground sm:size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-base font-bold sm:text-lg">{currentPlan?.name || t('super_admin.no_plan')}</div>
                            {subscription && (
                                <div className="mt-1 flex items-center gap-2">
                                    <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                        {subscription.status}
                                    </Badge>
                                    {subscription.ends_at && (
                                        <span className="text-xs text-muted-foreground">
                                            until {new Date(subscription.ends_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{t('super_admin.plan_details')}</CardTitle>
                        <Button variant="outline" size="sm" onClick={() => setPlanDialog(true)}>
                            {t('super_admin.change_plan')}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {currentPlan ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <p className="text-base font-semibold sm:text-lg">{currentPlan.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatCurrency(Number(currentPlan.price_monthly))}/month · {formatCurrency(Number(currentPlan.price_yearly))}/year
                                        </p>
                                    </div>
                                    <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'}>
                                        {subscription?.status || 'inactive'}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                                    <div className="rounded-lg border p-2 text-center sm:p-3">
                                        <p className="text-xl font-bold sm:text-2xl">{currentPlan.max_students === -1 ? '∞' : currentPlan.max_students}</p>
                                        <p className="text-xs text-muted-foreground">{t('super_admin.students')}</p>
                                    </div>
                                    <div className="rounded-lg border p-2 text-center sm:p-3">
                                        <p className="text-xl font-bold sm:text-2xl">{currentPlan.max_staff === -1 ? '∞' : currentPlan.max_staff}</p>
                                        <p className="text-xs text-muted-foreground">{t('super_admin.users')}</p>
                                    </div>
                                    <div className="rounded-lg border p-2 text-center sm:p-3">
                                        <p className="text-xl font-bold sm:text-2xl">{currentPlan.max_batches === -1 ? '∞' : currentPlan.max_batches}</p>
                                        <p className="text-xs text-muted-foreground">{t('super_admin.batches')}</p>
                                    </div>
                                </div>

                                {currentPlan.features && currentPlan.features.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium mb-2">{t('super_admin.features')}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {currentPlan.features.map((feature) => (
                                                <Badge key={feature} variant="secondary" className="gap-1">
                                                    <Check className="size-3" />
                                                    {feature}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">{t('super_admin.no_plan')}</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="size-4" />
                        {t('super_admin.plan_history')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {history.length > 0 ? (
                        <div className="space-y-3">
                            {history.map((record) => {
                                const getActionIcon = (action: string) => {
                                    switch (action) {
                                        case 'upgraded': return <ArrowUpCircle className="size-4 text-green-600" />;
                                        case 'downgraded': return <ArrowDownCircle className="size-4 text-orange-600" />;
                                        case 'renewed': return <RotateCcw className="size-4 text-blue-600" />;
                                        case 'activated': return <PlayCircle className="size-4 text-green-600" />;
                                        default: return <Check className="size-4 text-muted-foreground" />;
                                    }
                                };

                                const getActionLabel = (action: string) => {
                                    switch (action) {
                                        case 'upgraded': return t('super_admin.upgraded') ?? 'Upgraded';
                                        case 'downgraded': return t('super_admin.downgraded') ?? 'Downgraded';
                                        case 'renewed': return t('super_admin.renewed') ?? 'Renewed';
                                        case 'activated': return t('super_admin.activated') ?? 'Activated';
                                        case 'trial_started': return t('super_admin.trial_started') ?? 'Trial Started';
                                        default: return action;
                                    }
                                };

                                return (
                                    <div key={record.id} className="flex items-start gap-3 rounded-lg border p-3">
                                        <div className="mt-0.5 shrink-0">
                                            {getActionIcon(record.action)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{getActionLabel(record.action)}</span>
                                                <Badge variant={record.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                                    {record.status}
                                                </Badge>
                                            </div>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {record.old_plan_name && record.new_plan_name
                                                    ? `${record.old_plan_name} → ${record.new_plan_name}`
                                                    : record.new_plan_name || record.old_plan_name || '—'}
                                            </p>
                                            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                                <span>{new Date(record.created_at).toLocaleDateString()}</span>
                                                {record.billing_type && (
                                                    <span className="capitalize">{record.billing_type}</span>
                                                )}
                                                {record.amount != null && record.amount > 0 && (
                                                    <span>{formatCurrency(record.amount)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">{t('super_admin.no_history') ?? 'No plan history yet.'}</p>
                    )}
                </CardContent>
            </Card>

            <Dialog open={planDialog} onOpenChange={setPlanDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('super_admin.change_plan')}</DialogTitle>
                        <DialogDescription>
                            {t('super_admin.manage_owners')} {tenant?.name || ''}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('super_admin.select_plan')} />
                            </SelectTrigger>
                            <SelectContent>
                                {plans.map((plan) => (
                                    <SelectItem key={plan.id} value={String(plan.id)}>
                                        <div className="flex items-center justify-between gap-4">
                                            <span>{plan.name}</span>
                                            <span className="text-muted-foreground">
                                                {formatCurrency(Number(plan.price_monthly))}/mo
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedPlanId && (() => {
                            const plan = plans.find((p) => p.id === Number(selectedPlanId));

                            if (!plan) {
return null;
}

                            return (
                                <div className="rounded-lg border p-3 text-sm space-y-2">
                                    <div className="font-medium">{plan.name}</div>
                                    <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                                        <div>{t('super_admin.students')}: {plan.max_students === -1 ? t('super_admin.unlimited') : plan.max_students}</div>
                                        <div>{t('super_admin.users')}: {plan.max_staff === -1 ? t('super_admin.unlimited') : plan.max_staff}</div>
                                        <div>{t('super_admin.batches')}: {plan.max_batches === -1 ? t('super_admin.unlimited') : plan.max_batches}</div>
                                        <div>{t('super_admin.amount')}: {formatCurrency(Number(plan.price_monthly))}/mo</div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPlanDialog(false)}>
                            {t('actions.cancel')}
                        </Button>
                        <Button onClick={handleAssignPlan} disabled={!selectedPlanId}>
                            {t('super_admin.change_plan')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
