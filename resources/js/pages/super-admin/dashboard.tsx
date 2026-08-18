import { Link, router } from '@inertiajs/react';
import {
    Building2,
    GraduationCap,
    Layers,
    CreditCard,
    TrendingUp,
    Eye,
    MessageSquareReply,
} from 'lucide-react';
import { DataTable  } from '@/components/data-table';
import type {DataTableProps} from '@/components/data-table';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';

type Stats = {
    total_tenants: number;
    active_tenants: number;
    total_users: number;
    total_students: number;
    total_batches: number;
    active_batches: number;
    total_revenue: number;
    active_subscriptions: number;
    trial_subscriptions: number;
};

type TenantStat = {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    users_count: number;
    students_count: number;
    batches_count: number;
    subscription: {
        status: string;
        plan: { name: string } | null;
    } | null;
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

type RevenueByPlan = {
    id: number;
    name: string;
    slug: string;
    successful_payments: number;
    total_revenue: number | null;
};

type ContactMessage = {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    is_read: boolean;
    created_at: string;
};

type PageProps = {
    stats: Stats;
    tenantStats: TenantStat[];
    recentPayments: PaymentRecord[];
    revenueByPlan: RevenueByPlan[];
    recentContactMessages: ContactMessage[];
};

export default function SuperAdminDashboard({ stats, tenantStats, recentPayments, revenueByPlan, recentContactMessages }: PageProps) {
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

    const getSubscriptionBadge = (tenant: TenantStat) => {
        if (!tenant.subscription) {
return <Badge variant="outline" className="whitespace-nowrap">No Plan</Badge>;
}

        const planName = tenant.subscription.plan?.name ?? 'Unknown';

        if (tenant.subscription.status === 'trial') {
            return <Badge variant="outline" className="whitespace-nowrap">Trial</Badge>;
        }

        return <Badge className="bg-blue-600 text-white whitespace-nowrap">{planName}</Badge>;
    };

    const revenueByPlanColumns = (() => {
        type Col = NonNullable<DataTableProps<RevenueByPlan, unknown>['columns']>[number];

        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: 'Plan',
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">{row.original.name}</span>
                ),
            } as Col,
            {
                id: 'successful_payments',
                accessorKey: 'successful_payments',
                header: 'Payments',
                enableSorting: false,
                cell: ({ row }: any) => (
                    <div className="text-right">{row.original.successful_payments}</div>
                ),
            } as Col,
            {
                id: 'total_revenue',
                accessorKey: 'total_revenue',
                header: 'Revenue',
                enableSorting: false,
                cell: ({ row }: any) => (
                    <div className="text-right font-semibold">
                        {formatCurrency(row.original.total_revenue ?? 0)}
                    </div>
                ),
            } as Col,
        ];
    })();

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
                    <div className="text-right">{formatCurrency(row.original.amount)}</div>
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

    const contactMessagesColumns = (() => {
        type Col = NonNullable<DataTableProps<ContactMessage, unknown>['columns']>[number];

        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: 'Name',
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">{row.original.name}</span>
                ),
            } as Col,
            {
                id: 'email',
                accessorKey: 'email',
                header: 'Email',
                enableSorting: false,
                cell: ({ row }: any) => row.original.email,
            } as Col,
            {
                id: 'subject',
                accessorKey: 'subject',
                header: 'Subject',
                enableSorting: false,
                cell: ({ row }: any) => (
                    <span className="block max-w-[200px] truncate">{row.original.subject}</span>
                ),
            } as Col,
            {
                id: 'status',
                accessorKey: 'is_read',
                header: 'Status',
                enableSorting: false,
                cell: ({ row }: any) =>
                    !row.original.is_read ? (
                        <Badge className="bg-yellow-600 text-white whitespace-nowrap">Unread</Badge>
                    ) : (
                        <Badge variant="secondary" className="whitespace-nowrap">Read</Badge>
                    ),
            } as Col,
            {
                id: 'actions',
                header: '',
                enableSorting: false,
                enableHiding: false,
                cell: () => (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0"
                        onClick={() => router.get('/super-admin/contacts')}
                    >
                        <MessageSquareReply className="size-4" />
                    </Button>
                ),
            } as Col,
        ];
    })();

    const tenantColumns = (() => {
        type Col = NonNullable<DataTableProps<TenantStat, unknown>['columns']>[number];

        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: 'Name',
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">{row.original.name}</span>
                ),
            } as Col,
            {
                id: 'plan',
                accessorKey: 'subscription',
                header: 'Plan',
                enableSorting: false,
                cell: ({ row }: any) => getSubscriptionBadge(row.original as TenantStat),
            } as Col,
            {
                id: 'batches_count',
                accessorKey: 'batches_count',
                header: 'Batches',
                enableSorting: false,
                cell: ({ row }: any) => row.original.batches_count,
            } as Col,
            {
                id: 'status',
                accessorKey: 'is_active',
                header: 'Status',
                enableSorting: false,
                cell: ({ row }: any) => (
                    <Badge variant={row.original.is_active ? 'default' : 'destructive'} className="whitespace-nowrap">
                        {row.original.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                ),
            } as Col,
            {
                id: 'actions',
                header: '',
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }: any) => (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0"
                        onClick={() => router.get(`/super-admin/tenants/${row.original.id}/detail`)}
                    >
                        <Eye className="size-4" />
                    </Button>
                ),
            } as Col,
        ];
    })();

    return (
        <>
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
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <GraduationCap className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{stats.total_students}</div>
                            <p className="text-xs text-muted-foreground">{stats.total_users} users</p>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
                            <Layers className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{stats.active_batches}</div>
                            <p className="text-xs text-muted-foreground">of {stats.total_batches} total</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Revenue by Plan</CardTitle>
                            <CreditCard className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={revenueByPlanColumns}
                                data={revenueByPlan}
                                showPagination={false}
                                total={revenueByPlan.length}
                                itemName="plans"
                                emptyMessage="No payment data yet."
                                getRowId={(row) => String(row.id)}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center justify-between w-full">
                                <CardTitle>Recent Payments</CardTitle>
                                <Link href="/super-admin/payments" className="text-sm text-blue-600 hover:underline">
                                    View All
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={recentPaymentsColumns}
                                data={recentPayments}
                                showPagination={false}
                                total={recentPayments.length}
                                itemName="payments"
                                emptyMessage="No payments yet."
                                getRowId={(row) => String(row.id)}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Messages */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Contact Messages</CardTitle>
                        <Link href="/super-admin/contacts" className="text-sm text-blue-600 hover:underline">
                            View All
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={contactMessagesColumns}
                            data={recentContactMessages}
                            showPagination={false}
                            total={recentContactMessages.length}
                            itemName="messages"
                            emptyMessage="No contact messages yet."
                            getRowId={(row) => String(row.id)}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Coaching Centers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={tenantColumns}
                            data={tenantStats}
                            showPagination={false}
                            total={tenantStats.length}
                            itemName="coaching centers"
                            emptyMessage="No coaching centers yet."
                            getRowId={(row) => String(row.id)}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

SuperAdminDashboard.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/super-admin/dashboard' },
    ],
};