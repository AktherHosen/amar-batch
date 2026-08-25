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
import { ConfirmDialog } from '@/components/confirm-dialog';

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
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-3 sm:p-4">
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

                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                                {t('super_admin.students')}
                            </CardTitle>
                            <GraduationCap className="size-3.5 text-muted-foreground sm:size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold sm:text-2xl">
                                {stats.total_students}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {stats.active_students} {t('super_admin.active')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                                {t('super_admin.batches')}
                            </CardTitle>
                            <Layers className="size-3.5 text-muted-foreground sm:size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold sm:text-2xl">
                                {stats.total_batches}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {stats.active_batches} {t('super_admin.active')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                                {t('super_admin.total_revenue')}
                            </CardTitle>
                            <CreditCard className="size-3.5 text-muted-foreground sm:size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold sm:text-2xl">
                                {formatCurrency(stats.total_spent)}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {stats.successful_payments} {t('super_admin.active_payments')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                                {t('super_admin.subscriptions')}
                            </CardTitle>
                            <Building2 className="size-3.5 text-muted-foreground sm:size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-base font-bold sm:text-lg">
                                {tenant.subscription?.plan?.name || t('super_admin.no_plan')}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
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
                        <CardTitle>{t('super_admin.recent_payments')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={recentPayments}
                            enableColumnVisibility={false}
                            total={recentPayments.length}
                            itemName="payments"
                            emptyMessage={t('super_admin.no_payments')}
                            getRowId={(row) => String(row.id)}
                        />
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
