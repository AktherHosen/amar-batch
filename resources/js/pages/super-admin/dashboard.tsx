import { Link, router } from '@inertiajs/react';
import {
    Building2,
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

type TenantStat = {
    id: number;
    name: string;
    is_active: boolean;
    students_count: number;
    subscription: {
        status: string;
        plan: { name: string } | null;
    } | null;
};

type PageProps = {
    stats: Stats;
    tenantStats: TenantStat[];
    recentPayments: PaymentRecord[];
};

export default function SuperAdminDashboard({ stats, tenantStats, recentPayments }: PageProps) {
    const { formatCurrency } = useLocale();

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

    const recentPaymentsColumns = (() => {
        type Col = NonNullable<DataTableProps<PaymentRecord, unknown>['columns']>[number];

        return [
            {
                id: 'tenant',
                accessorKey: 'tenant',
                header: 'Tenant',
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">{row.original.tenant?.name ?? '—'}</span>
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
                    <div className="text-right font-semibold">{formatCurrency(row.original.amount)}</div>
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
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <Heading
                title="Platform Dashboard"
                description="Overview of all coaching centers"
            />

            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <Card className="py-3">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                        <CardTitle className="text-sm font-medium">Coaching Centers</CardTitle>
                        <Building2 className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="px-3 pb-2 pt-0">
                        <div className="text-2xl font-bold">{stats.total_tenants}</div>
                        <p className="text-xs text-muted-foreground">{stats.active_tenants} active</p>
                    </CardContent>
                </Card>

                <Card className="py-3">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <TrendingUp className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="px-3 pb-2 pt-0">
                        <div className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</div>
                        <p className="text-xs text-muted-foreground">{stats.active_subscriptions} active subs</p>
                    </CardContent>
                </Card>

                <Card className="py-3">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="px-3 pb-2 pt-0">
                        <div className="text-2xl font-bold">{stats.total_users}</div>
                    </CardContent>
                </Card>

                <Card className="py-3">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                        <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                        <CreditCard className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="px-3 pb-2 pt-0">
                        <div className="text-2xl font-bold">{stats.active_subscriptions}</div>
                        <p className="text-xs text-muted-foreground">{stats.trial_subscriptions} on trial</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Coaching Centers</CardTitle>
                        <Link href="/dashboard/tenants" className="text-sm text-muted-foreground hover:underline">
                            View All
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {tenantStats.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No coaching centers yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {tenantStats.map((tenant) => (
                                    <Link
                                        key={tenant.id}
                                        href={`/dashboard/tenants/${tenant.id}/detail`}
                                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{tenant.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-muted-foreground">
                                                    {tenant.students_count} students
                                                </span>
                                                <span className="text-xs text-muted-foreground">·</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {tenant.subscription?.plan?.name ?? 'No Plan'}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge variant={tenant.is_active ? 'default' : 'destructive'}>
                                            {tenant.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Payments</CardTitle>
                        <Link href="/dashboard/payments" className="text-sm text-muted-foreground hover:underline">
                            View All
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
                            emptyMessage="No payments yet."
                            getRowId={(row) => String(row.id)}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
