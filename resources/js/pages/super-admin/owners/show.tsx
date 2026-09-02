import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowUpCircle,
    ArrowDownCircle,
    Building2,
    Calendar,
    Check,
    CheckCircle2,
    CircleDot,
    CreditCard,
    History,
    Mail,
    Phone,
    PlayCircle,
    RotateCcw,
    Users,
    Settings,
    CalendarIcon,
    Copy,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useLocale } from '@/contexts/locale-context';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/date-picker';

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
    const { formatCurrency, formatDate, t } = useLocale();
    const [manageSheet, setManageSheet] = useState(false);
    const [confirmExpireOpen, setConfirmExpireOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState(
        String(owner.tenant?.subscription?.plan?.id || ''),
    );
    const [billingType, setBillingType] = useState(
        owner.tenant?.subscription?.billing_type || 'monthly'
    );
    const [expiryDate, setExpiryDate] = useState<string | undefined>(
        owner.tenant?.subscription?.ends_at ? owner.tenant.subscription.ends_at.split('T')[0] : undefined
    );

    useEffect(() => {
        setSelectedPlanId(String(owner.tenant?.subscription?.plan?.id || ''));
        setBillingType(owner.tenant?.subscription?.billing_type || 'monthly');
        setExpiryDate(owner.tenant?.subscription?.ends_at ? owner.tenant.subscription.ends_at.split('T')[0] : undefined);
    }, [owner.tenant?.subscription]);

    const tenant = owner.tenant;
    const subscription = tenant?.subscription;
    const currentPlan = subscription?.plan;

    const handleAssignPlan = () => {
        if (!selectedPlanId) return;

        router.post(
            `/dashboard/owners/${owner.id}/assign-plan`,
            { plan_id: Number(selectedPlanId), billing_type: billingType },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('toast.updated_successfully'));
                    setManageSheet(false);
                },
            },
        );
    };

    const handleUpdateExpiry = () => {
        if (!expiryDate) return;

        router.post(
            `/dashboard/owners/${owner.id}/update-expiry`,
            { ends_at: expiryDate },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Expiry date updated successfully.');
                    setManageSheet(false);
                },
            },
        );
    };

    const handleExpirePlan = () => {
        router.post(
            `/dashboard/owners/${owner.id}/expire-plan`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Subscription plan expired successfully.');
                    setConfirmExpireOpen(false);
                    setManageSheet(false);
                },
            },
        );
    };

    const getActionConfig = (action: string) => {
        switch (action) {
            case 'upgraded':
                return { icon: ArrowUpCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', label: t('super_admin.upgraded') ?? 'Upgraded' };
            case 'downgraded':
                return { icon: ArrowDownCircle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30', label: t('super_admin.downgraded') ?? 'Downgraded' };
            case 'renewed':
                return { icon: RotateCcw, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', label: t('super_admin.renewed') ?? 'Renewed' };
            case 'activated':
                return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', label: t('super_admin.activated') ?? 'Activated' };
            case 'trial_started':
                return { icon: PlayCircle, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30', label: t('super_admin.trial_started') ?? 'Trial Started' };
            default:
                return { icon: CircleDot, color: 'text-muted-foreground', bg: 'bg-muted', label: action };
        }
    };

    return (
        <>
            <Head title={owner.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex gap-4 items-center justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <Link href="/dashboard/owners" className="shrink-0">
                            <Button variant="ghost" size="icon" className="size-9">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div className="min-w-0">
                            <div className="flex items-center gap-3">
                                <h1 className="truncate text-lg font-bold tracking-tight sm:text-2xl">
                                    {owner.name}
                                </h1>

                            </div>
                            <p className="truncate text-sm text-muted-foreground">{owner.email}</p>
                        </div>
                    </div>
                    {tenant && (
                        <Badge variant={tenant.is_active ? 'default' : 'secondary'} className="h-6">
                            {tenant.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Users className="size-4 text-muted-foreground" />
                                Owner Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Full Name</p>
                                    <p className="text-sm font-medium">{owner.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Email</p>
                                    <p className="text-sm font-medium">{owner.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Phone</p>
                                <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-medium">{owner.phone || '—'}</p>
                                    {owner.phone && (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="size-5" 
                                            title="Copy phone number"
                                            onClick={() => {
                                                navigator.clipboard.writeText(owner.phone!);
                                                toast.success('Phone number copied to clipboard');
                                            }}
                                        >
                                            <Copy className="size-3 text-muted-foreground" />
                                        </Button>
                                    )}
                                </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Role</p>
                                    <p className="text-sm font-medium capitalize">{owner.role}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-muted-foreground">Joined</p>
                                    <p className="text-sm font-medium">{formatDate(new Date(owner.created_at))}</p>
                                </div>
                            </div>

                            {tenant && (
                                <>
                                    <Separator className="my-4" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Coaching Center</p>
                                            <div className="flex items-center gap-1.5">
                                                <Building2 className="size-3.5 text-muted-foreground" />
                                                <p className="text-sm font-medium">{tenant.name}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Center Email</p>
                                            <div className="flex items-center gap-1.5">
                                                <Mail className="size-3.5 text-muted-foreground" />
                                                <p className="text-sm font-medium">{tenant.email || '—'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Center Phone</p>
                                            <div className="flex items-center gap-1.5 group">
                                                <Phone className="size-3.5 text-muted-foreground" />
                                                <p className="text-sm font-medium">{tenant.phone || '—'}</p>
                                                {tenant.phone && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="size-5" 
                                                        title="Copy phone number"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(tenant.phone!);
                                                            toast.success('Phone number copied to clipboard');
                                                        }}
                                                    >
                                                        <Copy className="size-3 text-muted-foreground" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CreditCard className="size-4 text-muted-foreground" />
                                Subscription
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" onClick={() => setManageSheet(true)}>
                                                <Settings className="size-4" />
                                                <span className="sr-only">Manage Subscription</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Manage Subscription</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {currentPlan ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg border p-3">
                                        <div>
                                            <p className="font-semibold">{currentPlan.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatCurrency(Number(currentPlan.price_monthly))}/month
                                            </p>
                                        </div>
                                        <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'}>
                                            {subscription?.status || 'inactive'}
                                        </Badge>
                                    </div>

                                    {subscription && (
                                        <div className="space-y-2 text-sm">
                                            {subscription.billing_type && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground">Billing</span>
                                                    <span className="capitalize font-medium">{subscription.billing_type}</span>
                                                </div>
                                            )}
                                            {subscription.trial_ends_at && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground">Trial ends</span>
                                                    <span className="font-medium">{formatDate(new Date(subscription.trial_ends_at))}</span>
                                                </div>
                                            )}
                                            {subscription.ends_at && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground">Expires</span>
                                                    <span className="font-medium">{formatDate(new Date(subscription.ends_at))}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <Separator />

                                    <div>
                                        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            Plan Limits
                                        </p>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Students</span>
                                                    <span className="font-medium">
                                                        {currentPlan.max_students === -1 ? '∞' : currentPlan.max_students}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Staff</span>
                                                    <span className="font-medium">
                                                        {currentPlan.max_staff === -1 ? '∞' : currentPlan.max_staff}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Batches</span>
                                                    <span className="font-medium">
                                                        {currentPlan.max_batches === -1 ? '∞' : currentPlan.max_batches}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {currentPlan.features && currentPlan.features.length > 0 && (
                                        <>
                                            <Separator />
                                            <div>
                                                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                    Features
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {currentPlan.features.map((feature) => (
                                                        <Badge key={feature} variant="secondary" className="gap-1 text-xs">
                                                            <Check className="size-3" />
                                                            {feature.replace(/_/g, ' ')}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <CreditCard className="mb-2 size-8 text-muted-foreground/50" />
                                    <p className="text-sm text-muted-foreground">{t('super_admin.no_plan')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <History className="size-4 text-muted-foreground" />
                            Plan History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {history.length > 0 ? (
                            <div className="relative space-y-0">
                                <div className="absolute left-[17px] top-2 bottom-2 w-px bg-border" />
                                <div className="space-y-4">
                                    {history.map((record, index) => {
                                        const config = getActionConfig(record.action);
                                        const Icon = config.icon;

                                        return (
                                            <div key={record.id} className="relative flex items-start gap-3">
                                                <div className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full ${config.bg}`}>
                                                    <Icon className={`size-4 ${config.color}`} />
                                                </div>
                                                <div className="min-w-0 flex-1 pt-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">{config.label}</span>
                                                        <Badge variant={record.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                                                            {record.status}
                                                        </Badge>
                                                    </div>
                                                    {record.old_plan_name && record.new_plan_name && (
                                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                                            {record.old_plan_name} → {record.new_plan_name}
                                                        </p>
                                                    )}
                                                    {!record.old_plan_name && record.new_plan_name && (
                                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                                            {record.new_plan_name}
                                                        </p>
                                                    )}
                                                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Calendar className="size-3" />
                                                        <span>{formatDate(new Date(record.created_at))}</span>
                                                        {record.billing_type && (
                                                            <>
                                                                <span className="text-border">·</span>
                                                                <span className="capitalize">{record.billing_type}</span>
                                                            </>
                                                        )}
                                                        {record.amount != null && record.amount > 0 && (
                                                            <>
                                                                <span className="text-border">·</span>
                                                                <span>{formatCurrency(record.amount)}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <History className="mb-2 size-8 text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground">{t('super_admin.no_history') ?? 'No plan history yet.'}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Sheet open={manageSheet} onOpenChange={setManageSheet}>
                <SheetContent className="flex h-full flex-col overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Manage Subscription</SheetTitle>
                        <SheetDescription>
                            Update the plan or expiry date for {tenant?.name || owner.name}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex flex-1 flex-col gap-4 px-4 pb-4">
                        <div className="space-y-4 rounded-lg border p-4 shadow-sm bg-card">
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium leading-none">Change Plan</h4>
                                <p className="text-sm text-muted-foreground">Select a new plan to assign.</p>
                            </div>
                            <div className="grid gap-2">
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
                                                        {formatCurrency(billingType === 'yearly' ? Number(plan.price_yearly) : Number(plan.price_monthly))}/{billingType === 'yearly' ? 'yr' : 'mo'}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={billingType} onValueChange={setBillingType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Billing Cycle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedPlanId &&
                                (() => {
                                    const plan = plans.find((p) => p.id === Number(selectedPlanId));
                                    if (!plan) return null;

                                    return (
                                        <div className="rounded-md bg-muted/50 p-3 text-sm space-y-3">
                                            <div className="font-medium">{plan.name}</div>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                                <div>Students: {plan.max_students === -1 ? '∞' : plan.max_students}</div>
                                                <div>Staff: {plan.max_staff === -1 ? '∞' : plan.max_staff}</div>
                                                <div>Batches: {plan.max_batches === -1 ? '∞' : plan.max_batches}</div>
                                                <div>Price: {formatCurrency(billingType === 'yearly' ? Number(plan.price_yearly) : Number(plan.price_monthly))}/{billingType === 'yearly' ? 'yr' : 'mo'}</div>
                                            </div>
                                        </div>
                                    );
                                })()}

                            <Button onClick={handleAssignPlan} disabled={!selectedPlanId} className="w-full">
                                {t('super_admin.change_plan')}
                            </Button>
                        </div>

                        <div className="space-y-4 rounded-lg border p-4 shadow-sm bg-card">
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium leading-none">Update Expiry Date</h4>
                                <p className="text-sm text-muted-foreground">Manually change when this subscription expires.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <Label htmlFor="expiryDate" className="sr-only">Expiry Date</Label>
                                    <DatePicker
                                        value={expiryDate || null}
                                        onValueChange={(val) => setExpiryDate(val)}
                                        placeholder="Pick a date"
                                        className="w-full"
                                    />
                                </div>
                                <Button onClick={handleUpdateExpiry} disabled={!expiryDate} variant="secondary" className="shrink-0">
                                    Update
                                </Button>
                            </div>
                        </div>

                        {subscription?.status !== 'past_due' && (
                            <div className="mt-auto space-y-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 shadow-sm">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium leading-none text-destructive">Danger Zone</h4>
                                    <p className="text-sm text-destructive/80">Immediately expire this plan and revoke access.</p>
                                </div>
                                <Button variant="destructive" className="w-full" onClick={() => setConfirmExpireOpen(true)}>
                                    Expire Plan Now
                                </Button>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            <ConfirmDialog
                open={confirmExpireOpen}
                onOpenChange={setConfirmExpireOpen}
                title="Expire Subscription"
                description="Are you sure you want to expire this subscription immediately? This action will set the plan status to past due and revoke access."
                confirmText="Expire Plan"
                variant="destructive"
                onConfirm={handleExpirePlan}
            />
        </>
    );
}
