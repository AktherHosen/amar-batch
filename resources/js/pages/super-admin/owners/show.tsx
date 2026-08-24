import { Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CreditCard,
    GraduationCap,
    Layers,
    Users,
    Mail,
    Phone,
    Check,
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

type PageProps = {
    owner: Owner;
    stats: {
        total_students: number;
        active_students: number;
        total_batches: number;
        total_users: number;
        total_payments: number;
        total_spent: number;
    } | null;
    plans: Plan[];
};

export default function OwnerShow({ owner, stats, plans }: PageProps) {
    const { formatCurrency } = useLocale();
    const [planDialog, setPlanDialog] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState(
        String(owner.tenant?.subscription?.plan?.id || '')
    );

    const tenant = owner.tenant;
    const subscription = tenant?.subscription;
    const currentPlan = subscription?.plan;

    const handleAssignPlan = () => {
        if (!selectedPlanId) return;

        router.post(`/dashboard/owners/${owner.id}/assign-plan`, {
            plan_id: Number(selectedPlanId),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Plan updated successfully');
                setPlanDialog(false);
            },
        });
    };

    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="size-9 shrink-0" onClick={() => window.history.back()}>
                        <ArrowLeft className="size-4" />
                    </Button>
                    <Heading
                        title={owner.name}
                        description={owner.email}
                    />
                    <div className="ml-auto flex items-center gap-2">
                        <Badge variant={owner.role === 'owner' ? 'default' : 'destructive'} className="hidden sm:inline-flex">
                            {owner.role === 'owner' ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Coaching Center</CardTitle>
                            <Building2 className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-lg font-bold">{tenant?.name || '—'}</div>
                            {tenant && (
                                <Badge variant={tenant.is_active ? 'default' : 'destructive'} className="mt-1 text-xs">
                                    {tenant.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Plan</CardTitle>
                            <CreditCard className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-lg font-bold">{currentPlan?.name || 'No Plan'}</div>
                            {subscription && (
                                <div className="flex items-center gap-2 mt-1">
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

                    {stats && (
                        <>
                            <Card className="py-3">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                                    <CardTitle className="text-sm font-medium">Students</CardTitle>
                                    <GraduationCap className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent className="px-3 pb-2 pt-0">
                                    <div className="text-2xl font-bold">{stats.total_students}</div>
                                    <p className="text-xs text-muted-foreground">{stats.active_students} active</p>
                                </CardContent>
                            </Card>

                            <Card className="py-3">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                                    <CreditCard className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent className="px-3 pb-2 pt-0">
                                    <div className="text-2xl font-bold">{formatCurrency(stats.total_spent)}</div>
                                    <p className="text-xs text-muted-foreground">{stats.total_payments} payments</p>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Plan Details</CardTitle>
                        <Button variant="outline" size="sm" onClick={() => setPlanDialog(true)}>
                            Change Plan
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {currentPlan ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <p className="text-lg font-semibold">{currentPlan.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatCurrency(Number(currentPlan.price_monthly))}/month · {formatCurrency(Number(currentPlan.price_yearly))}/year
                                        </p>
                                    </div>
                                    <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'}>
                                        {subscription?.status || 'inactive'}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="rounded-lg border p-3 text-center">
                                        <p className="text-2xl font-bold">{currentPlan.max_students === -1 ? '∞' : currentPlan.max_students}</p>
                                        <p className="text-xs text-muted-foreground">Students</p>
                                    </div>
                                    <div className="rounded-lg border p-3 text-center">
                                        <p className="text-2xl font-bold">{currentPlan.max_staff === -1 ? '∞' : currentPlan.max_staff}</p>
                                        <p className="text-xs text-muted-foreground">Staff</p>
                                    </div>
                                    <div className="rounded-lg border p-3 text-center">
                                        <p className="text-2xl font-bold">{currentPlan.max_batches === -1 ? '∞' : currentPlan.max_batches}</p>
                                        <p className="text-xs text-muted-foreground">Batches</p>
                                    </div>
                                </div>

                                {currentPlan.features && currentPlan.features.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium mb-2">Features</p>
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
                            <p className="text-sm text-muted-foreground">No plan assigned.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={planDialog} onOpenChange={setPlanDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Plan</DialogTitle>
                        <DialogDescription>
                            Select a new plan for {tenant?.name || 'this coaching center'}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a plan" />
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
                            if (!plan) return null;
                            return (
                                <div className="rounded-lg border p-3 text-sm space-y-2">
                                    <div className="font-medium">{plan.name}</div>
                                    <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                                        <div>Students: {plan.max_students === -1 ? 'Unlimited' : plan.max_students}</div>
                                        <div>Staff: {plan.max_staff === -1 ? 'Unlimited' : plan.max_staff}</div>
                                        <div>Batches: {plan.max_batches === -1 ? 'Unlimited' : plan.max_batches}</div>
                                        <div>Price: {formatCurrency(Number(plan.price_monthly))}/mo</div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPlanDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAssignPlan} disabled={!selectedPlanId}>
                            Assign Plan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
