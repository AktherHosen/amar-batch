import { Link } from '@inertiajs/react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
    Building2,
    CreditCard,
    MessageSquare,
    Settings,
    TrendingUp,
    Users,
} from 'lucide-react';
import { DataTable } from '@/components/data-table';
import type { DataTableProps } from '@/components/data-table';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
);

type Stats = {
    total_tenants: number;
    active_tenants: number;
    total_users: number;
    total_revenue: number;
    active_subscriptions: number;
    trial_subscriptions: number;
    pending_payments: number;
    total_students: number;
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

type RecentTenant = {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    created_at: string;
    plan: string;
    status: string;
};

type RevenueTrend = {
    month: string;
    revenue: number;
};

type PageProps = {
    stats: Stats;
    recentPayments: PaymentRecord[];
    ownerActivity: OwnerActivity[];
    recentTenants: RecentTenant[];
    revenueTrend: RevenueTrend[];
    planDistribution: Record<string, number>;
};

export default function SuperAdminDashboard({
    stats,
    recentPayments,
    ownerActivity,
    recentTenants,
    revenueTrend,
    planDistribution,
}: PageProps) {
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

    const getSubscriptionBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-600 text-white whitespace-nowrap text-[10px]">Active</Badge>;
            case 'trial':
                return <Badge className="bg-blue-600 text-white whitespace-nowrap text-[10px]">Trial</Badge>;
            default:
                return <Badge variant="secondary" className="whitespace-nowrap text-[10px]">None</Badge>;
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

    const revenueChartData = {
        labels: revenueTrend.map((r) => r.month),
        datasets: [
            {
                label: 'Revenue',
                data: revenueTrend.map((r) => r.revenue),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 5,
            },
        ],
    };

    const revenueChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx: any) => `${formatCurrency(ctx.raw)}`,
                },
            },
        },
        scales: {
            x: { grid: { display: false } },
            y: {
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: {
                    callback: (value: any) => `${(value / 1000).toFixed(0)}k`,
                },
            },
        },
    };

    const planNames = Object.keys(planDistribution);
    const planColors = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6'];

    const planChartData = {
        labels: planNames.length > 0 ? planNames : ['No Data'],
        datasets: [
            {
                data: planNames.length > 0 ? Object.values(planDistribution) : [1],
                backgroundColor: planNames.length > 0 ? planColors.slice(0, planNames.length) : ['#e5e7eb'],
                borderWidth: 0,
            },
        ],
    };

    const planChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' as const, labels: { padding: 12, usePointStyle: true } },
        },
        cutout: '65%',
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-hidden rounded-xl p-3 sm:p-4">
            <Heading
                title={t('super_admin.platform_dashboard')}
                description={t('super_admin.overview_description')}
            />

            {/* Row 1: Stats — 4 col desktop, 2 col mobile */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">{t('super_admin.total_users')}</CardTitle>
                        <Users className="size-3.5 text-muted-foreground sm:size-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold sm:text-2xl">{stats.total_users}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{stats.total_students} students</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">{t('super_admin.subscriptions')}</CardTitle>
                        <TrendingUp className="size-3.5 text-muted-foreground sm:size-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold sm:text-2xl">{stats.active_subscriptions}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{stats.trial_subscriptions} {t('super_admin.on_trial')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">{t('super_admin.coaching_centers')}</CardTitle>
                        <Building2 className="size-3.5 text-muted-foreground sm:size-4" />
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
                        <p className="mt-1 text-xs text-muted-foreground">{stats.pending_payments} pending</p>
                    </CardContent>
                </Card>
            </div>

            {/* Row 2: Charts — 2 col */}
            <div className="grid gap-3 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px]">
                            <Line data={revenueChartData} options={revenueChartOptions} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Plan Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px]">
                            <Doughnut data={planChartData} options={planChartOptions} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Row 3: Recent Signups + Owner Activity — 2 col */}
            <div className="grid gap-3 lg:grid-cols-2">
                <Card className="min-w-0">
                    <CardHeader>
                        <CardTitle>Recent Signups</CardTitle>
                        <Link href="/dashboard/tenants" className="text-xs text-muted-foreground hover:underline sm:text-sm">
                            {t('super_admin.view_all')}
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentTenants.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No tenants yet</p>
                        ) : (
                            <div className="space-y-2">
                                {recentTenants.map((tenant) => (
                                    <Link
                                        key={tenant.id}
                                        href={`/dashboard/tenants/${tenant.id}`}
                                        className="flex items-center justify-between rounded-lg border p-2.5 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{tenant.name}</p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs text-muted-foreground">{tenant.plan}</span>
                                                <span className="text-xs text-muted-foreground">·</span>
                                                <span className="text-xs text-muted-foreground">{tenant.created_at}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {getSubscriptionBadge(tenant.status)}
                                            {!tenant.is_active && (
                                                <Badge variant="destructive" className="text-[10px]">Inactive</Badge>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="min-w-0">
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
                            <div className="space-y-2">
                                {ownerActivity.map((owner) => (
                                    <Link
                                        key={owner.id}
                                        href={`/dashboard/owners/${owner.id}`}
                                        className="flex items-center justify-between rounded-lg border p-2.5 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{owner.name}</p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="truncate text-xs text-muted-foreground">{owner.tenant?.name ?? '—'}</span>
                                                {owner.last_login_at && (
                                                    <>
                                                        <span className="text-xs text-muted-foreground">·</span>
                                                        <span className="whitespace-nowrap text-xs text-muted-foreground">{owner.last_login_at}</span>
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
            </div>

            {/* Row 4: Payments + Quick Actions — 2 col */}
            <div className="grid gap-3 lg:grid-cols-2">
                <Card className="min-w-0">
                    <CardHeader>
                        <CardTitle>{t('super_admin.recent_payments')}</CardTitle>
                        <Link href="/dashboard/payments" className="text-xs text-muted-foreground hover:underline sm:text-sm">
                            {t('super_admin.view_all')}
                        </Link>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <DataTable
                            columns={recentPaymentsColumns}
                            data={recentPayments}
                            enableColumnVisibility={false}
                            total={recentPayments.length}
                            itemName="payments"
                            emptyMessage={t('super_admin.no_payments')}
                            getRowId={(row) => String(row.id)}
                        />
                    </CardContent>
                </Card>

                <Card className="min-w-0">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <Link href="/dashboard/plans?create=true">
                                <Button variant="outline" className="w-full justify-start">
                                    <Settings className="mr-2 size-4" />
                                    Create Plan
                                </Button>
                            </Link>
                            <Link href="/dashboard/payments?status=pending">
                                <Button variant="outline" className="w-full justify-start">
                                    <CreditCard className="mr-2 size-4" />
                                    Approve Payment
                                </Button>
                            </Link>
                            <Link href="/dashboard/owners">
                                <Button variant="outline" className="w-full justify-start">
                                    <Building2 className="mr-2 size-4" />
                                    Manage Owners
                                </Button>
                            </Link>
                            <Link href="/dashboard/contacts?status=unread">
                                <Button variant="outline" className="w-full justify-start">
                                    <MessageSquare className="mr-2 size-4" />
                                    Reply Messages
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
