import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { router } from '@inertiajs/react';
import { ArrowLeft, Building2, Users, GraduationCap, Layers, CreditCard, Eye } from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { useLocale } from '@/contexts/locale-context';

type Tenant = {
    id: number;
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    is_active: boolean;
    timezone: string;
    currency: string;
    created_at: string;
    users_count: number;
    students_count: number;
    batches_count: number;
    subscription?: {
        status: string;
        billing_type: string | null;
        ends_at: string | null;
        plan: { name: string; slug: string } | null;
    } | null;
};

type PaymentRecord = {
    id: number;
    amount: number;
    status: string;
    billing_type: string | null;
    paid_at: string | null;
    created_at: string;
    plan: { name: string } | null;
};

type PageProps = {
    tenant: Tenant;
    stats: {
        total_users: number;
        total_students: number;
        active_students: number;
        total_batches: number;
        active_batches: number;
        total_payments: number;
        successful_payments: number;
        total_spent: number;
        total_enrollments: number;
    };
    recentPayments: PaymentRecord[];
};

export default function TenantShow({ tenant, stats, recentPayments }: PageProps) {
    const [toggleDialog, setToggleDialog] = useState(false);
    const { formatCurrency } = useLocale();

    const handleToggle = () => {
        router.post(`/super-admin/tenants/${tenant.id}/toggle-active`, {}, {
            onSuccess: () => {
                toast.success(`Tenant ${tenant.is_active ? 'deactivated' : 'activated'} successfully`);
            },
        });
        setToggleDialog(false);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return <Badge className="bg-green-600 text-white whitespace-nowrap">Success</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-600 text-white whitespace-nowrap">Pending</Badge>;
            case 'failed':
                return <Badge className="bg-red-600 text-white whitespace-nowrap">Failed</Badge>;
            default:
                return <Badge variant="secondary" className="whitespace-nowrap">{status}</Badge>;
        }
    };

    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                            <ArrowLeft className="size-4" />
                        </Button>
                        <Heading
                            title={tenant.name}
                            description={tenant.email || 'No email'}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.get(`/super-admin/tenants/${tenant.id}/detail`)}
                        >
                            <Eye className="mr-2 size-4" />
                            View Full History
                        </Button>
                        <Button
                            variant={tenant.is_active ? 'destructive' : 'default'}
                            onClick={() => setToggleDialog(true)}
                        >
                            {tenant.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                    </div>
                </div>

                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                            <CreditCard className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{formatCurrency(stats.total_spent)}</div>
                            <p className="text-xs text-muted-foreground">{stats.successful_payments} paid</p>
                        </CardContent>
                    </Card>

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
                            <CardTitle className="text-sm font-medium">Batches</CardTitle>
                            <Layers className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{stats.total_batches}</div>
                            <p className="text-xs text-muted-foreground">{stats.active_batches} active</p>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
                            <Building2 className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-lg font-bold">
                                {tenant.subscription?.plan?.name || 'No Plan'}
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={tenant.subscription?.status === 'active' ? 'default' : 'secondary'}>
                                    {tenant.subscription?.status || 'none'}
                                </Badge>
                                {tenant.subscription?.ends_at && (
                                    <span className="text-xs text-muted-foreground">
                                        until {new Date(tenant.subscription.ends_at).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Staff</CardTitle>
                            <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{stats.total_users}</div>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
                            <Layers className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{stats.total_enrollments}</div>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Payments</CardTitle>
                            <CreditCard className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{stats.total_payments}</div>
                            <p className="text-xs text-muted-foreground">{stats.successful_payments} successful</p>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Billing</CardTitle>
                            <CreditCard className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-lg font-bold capitalize">
                                {tenant.subscription?.billing_type ?? '—'}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Payments</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.get(`/super-admin/tenants/${tenant.id}/detail`)}
                        >
                            View All
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentPayments.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="whitespace-nowrap">Date</TableHead>
                                        <TableHead className="whitespace-nowrap">Plan</TableHead>
                                        <TableHead className="whitespace-nowrap text-right">Amount</TableHead>
                                        <TableHead className="whitespace-nowrap">Billing</TableHead>
                                        <TableHead className="whitespace-nowrap">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentPayments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {new Date(payment.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{payment.plan?.name ?? '—'}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap font-semibold">
                                                {formatCurrency(payment.amount)}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap capitalize">{payment.billing_type ?? '—'}</TableCell>
                                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-sm text-muted-foreground">No payments yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={toggleDialog}
                onOpenChange={setToggleDialog}
                title={tenant.is_active ? 'Deactivate Tenant' : 'Activate Tenant'}
                description={`Are you sure you want to ${tenant.is_active ? 'deactivate' : 'activate'} "${tenant.name}"? ${tenant.is_active ? 'All users will lose access.' : ''}`}
                confirmText={tenant.is_active ? 'Deactivate' : 'Activate'}
                variant={tenant.is_active ? 'destructive' : 'default'}
                onConfirm={handleToggle}
            />
        </>
    );
}

TenantShow.layout = {
    breadcrumbs: [
        { title: 'Coaching Centers', href: '/super-admin/tenants' },
        { title: 'Details' },
    ],
};
