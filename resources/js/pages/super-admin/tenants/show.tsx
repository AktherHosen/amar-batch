import type { DataTableProps } from '@/components/data-table';
import { DataTable } from '@/components/data-table';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';
import { router } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Check,
    CreditCard,
    GraduationCap,
    Layers,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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

export default function TenantShow({
    tenant,
    stats,
    recentPayments,
}: PageProps) {
    const [toggleDialog, setToggleDialog] = useState(false);
    const { formatCurrency, t } = useLocale();

    const handleToggle = () => {
        router.post(
            `/dashboard/tenants/${tenant.id}/toggle-active`,
            {},
            {
                onSuccess: () => {
                    toast.success(t('toast.updated_successfully'));
                },
            },
        );
        setToggleDialog(false);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return (
                    <Badge className="bg-green-600 whitespace-nowrap text-white">
                        Success
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge className="bg-yellow-600 whitespace-nowrap text-white">
                        Pending
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge className="bg-red-600 whitespace-nowrap text-white">
                        Failed
                    </Badge>
                );
            default:
                return (
                    <Badge variant="secondary" className="whitespace-nowrap">
                        {status}
                    </Badge>
                );
        }
    };

    const columns = (() => {
        type Col = NonNullable<
            DataTableProps<PaymentRecord, unknown>['columns']
        >[number];

        return [
            {
                id: 'created_at',
                accessorKey: 'created_at',
                header: 'Date',
                enableSorting: false,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">
                        {new Date(row.original.created_at).toLocaleDateString()}
                    </span>
                ),
            } as Col,
            {
                id: 'plan',
                accessorKey: 'plan',
                header: 'Plan',
                enableSorting: false,
                cell: ({ row }: any) => row.original.plan?.name ?? '—',
            } as Col,
            {
                id: 'amount',
                accessorKey: 'amount',
                header: 'Amount',
                enableSorting: false,
                cell: ({ row }: any) => (
                    <div className="text-right font-semibold">
                        {formatCurrency(row.original.amount)}
                    </div>
                ),
            } as Col,
            {
                id: 'status',
                accessorKey: 'status',
                header: 'Status',
                enableSorting: false,
                cell: ({ row }: any) => getStatusBadge(row.original.status),
            } as Col,
        ];
    })();

    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 shrink-0"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="size-4" />
                        </Button>
                        <Heading
                            title={tenant.name}
                            description={tenant.email || 'No email'}
                        />
                    </div>

                    <Button
                        variant={tenant.is_active ? 'destructive' : 'default'}
                        size="icon"
                        className="size-9"
                        onClick={() => setToggleDialog(true)}
                    >
                        {tenant.is_active ? (
                            <Trash2 className="size-4" />
                        ) : (
                            <Check className="size-4" />
                        )}
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">
                                Students
                            </CardTitle>
                            <GraduationCap className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pt-0 pb-2">
                            <div className="text-2xl font-bold">
                                {stats.total_students}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.active_students} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">
                                Batches
                            </CardTitle>
                            <Layers className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pt-0 pb-2">
                            <div className="text-2xl font-bold">
                                {stats.total_batches}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.active_batches} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">
                                Revenue
                            </CardTitle>
                            <CreditCard className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pt-0 pb-2">
                            <div className="text-2xl font-bold">
                                {formatCurrency(stats.total_spent)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.successful_payments} paid
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">
                                Subscription
                            </CardTitle>
                            <Building2 className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pt-0 pb-2">
                            <div className="text-lg font-bold">
                                {tenant.subscription?.plan?.name || 'No Plan'}
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={
                                        tenant.subscription?.status === 'active'
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {tenant.subscription?.status || 'none'}
                                </Badge>
                                {tenant.subscription?.ends_at && (
                                    <span className="text-xs text-muted-foreground">
                                        until{' '}
                                        {new Date(
                                            tenant.subscription.ends_at,
                                        ).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={recentPayments}
                            showPagination={false}
                            enableColumnVisibility={false}
                            total={recentPayments.length}
                            itemName="payments"
                            emptyMessage="No payments yet."
                            getRowId={(row) => String(row.id)}
                        />
                    </CardContent>
                </Card>
            </div>

            {toggleDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
                        <h3 className="text-lg font-semibold">
                            {tenant.is_active
                                ? 'Deactivate Tenant'
                                : 'Activate Tenant'}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Are you sure you want to{' '}
                            {tenant.is_active ? 'deactivate' : 'activate'} "
                            {tenant.name}"?{' '}
                            {tenant.is_active && 'All users will lose access.'}
                        </p>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setToggleDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant={
                                    tenant.is_active ? 'destructive' : 'default'
                                }
                                onClick={handleToggle}
                            >
                                {tenant.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
