import { Link } from '@inertiajs/react';
import {
    CreditCard,
    TrendingUp,
    Users,
} from 'lucide-react';
import { DataTable } from '@/components/data-table';
import type { DataTableProps } from '@/components/data-table';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';

type Stats = {
    total_tenants: number;
    active_tenants: number;
    total_users: number;
    total_revenue: number;
    active_subscriptions: number;
    trial_subscriptions: number;
};

type PaymentRecord = {
    id: number;
    amount: number;
    status: string;
    billing_type: string;
    paid_at: string | null;
    created_at: string;
    tenant: { name: string } | null;
    plan: { name: string } | null;
};

type OwnerActivity = {
    id: number;
    name: string;
    email: string;
    tenant: { id: number; name: string } | null;
    last_login_at: string | null;
    last_activity: string | null;
};

type PageProps = {
    stats: Stats;
    recentPayments: PaymentRecord[];
    ownerActivity: OwnerActivity[];
};

export default function SuperAdminDashboard({ stats, recentPayments, ownerActivity }: PageProps) {
    const { formatCurrency, t } = useLocale();

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return <Badge className="bg-green-600 text-white whitespace-nowrap">{t('super_admin.active_payments')}</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-600 text-white whitespace-nowrap">{t('super_admin.pending')}</Badge>;
            case 'failed':
                return <Badge className="bg-red-600 text-white whitespace-nowrap">{t('super_admin.failed')}</Badge>;
            default:
                return <Badge variant="secondary" className="whitespace-nowrap">{status}</Badge>;
        }
    };

    const recentPaymentsColumns: NonNullable<DataTableProps<PaymentRecord, unknown>['columns']> = [
        {
            id: 'tenant',
            accessorKey: 'tenant',
            header: t('super_admin.coaching_centers'),
            enableSorting: true,
            meta: { sticky: true },
            cell: ({ row }: any) => (
                <span className="font-medium">{row.original.tenant?.name ?? '—'}</span>
            ),
        },
        {
            id: 'plan',
            accessorKey: 'plan',
            header: t('super_admin.plan_name'),
            enableSorting: false,
            cell: ({ row }: any) => row.original.plan?.name ?? '—',
        },
        {
            id: 'amount',
            accessorKey: 'amount',
            header: t('super_admin.amount'),
            enableSorting: false,
            cell: ({ row }: any) => (
                <div className="text-right font-semibold">{formatCurrency(row.original.amount)}</div>
            ),
        },
        {
            id: 'status',
            accessorKey: 'status',
            header: t('super_admin.status'),
            enableSorting: false,
            cell: ({ row }: any) => getStatusBadge(row.original.status),
        },
    ];

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden rounded-xl p-3 sm:p-4">
            <Heading
                title={t('super_admin.platform_dashboard')}
                description={t('super_admin.overview_description')}
            />

            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">{t('super_admin.coaching_centers')}</CardTitle>
                        <TrendingUp className="size-3.5 text-muted-foreground sm:size-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold sm:text-2xl">{stats.total_tenants}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{stats.active_tenants} {t('super_admin.active')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">{t('super_admin.total_revenue')}</CardTitle>
                        <CreditCard className="size-3.5 text-muted-foreground sm:size-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold sm:text-2xl">{formatCurrency(stats.total_revenue)}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{stats.active_subscriptions} {t('super_admin.active_subs')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">{t('super_admin.total_users')}</CardTitle>
                        <Users className="size-3.5 text-muted-foreground sm:size-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold sm:text-2xl">{stats.total_users}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">{t('super_admin.subscriptions')}</CardTitle>
                        <CreditCard className="size-3.5 text-muted-foreground sm:size-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold sm:text-2xl">{stats.active_subscriptions}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{stats.trial_subscriptions} {t('super_admin.on_trial')}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('super_admin.owner_login_activity')}</CardTitle>
                        <Link href="/dashboard/owners" className="text-xs text-muted-foreground hover:underline sm:text-sm">
                            {t('super_admin.view_all')}
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {ownerActivity.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t('super_admin.no_active_owners')}</p>
                        ) : (
                            <div className="space-y-3">
                                {ownerActivity.map((owner) => (
                                    <Link
                                        key={owner.id}
                                        href={`/dashboard/owners/${owner.id}`}
                                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{owner.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {owner.tenant?.name ?? '—'}
                                                </span>
                                                {owner.last_login_at && (
                                                    <>
                                                        <span className="text-xs text-muted-foreground">·</span>
                                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                            {owner.last_login_at}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <Badge variant={owner.last_activity ? 'default' : 'secondary'} className="shrink-0">
                                            {owner.last_activity ? t('super_admin.active') : t('super_admin.inactive')}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('super_admin.recent_payments')}</CardTitle>
                        <Link href="/dashboard/payments" className="text-xs text-muted-foreground hover:underline sm:text-sm">
                            {t('super_admin.view_all')}
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={recentPaymentsColumns}
                            data={recentPayments}
                            showPagination={false}
                            enableColumnVisibility={false}
                            total={recentPayments.length}
                            itemName="payments"
                            emptyMessage={t('super_admin.no_payments')}
                            getRowId={(row) => String(row.id)}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
