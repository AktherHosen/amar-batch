import { Link, router } from '@inertiajs/react';
import { ArrowLeft, CreditCard, Users, GraduationCap, Layers, CalendarClock, Clock } from 'lucide-react';
import { DataTable  } from '@/components/data-table';
import type {DataTableProps} from '@/components/data-table';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';

type Plan = {
    id: number;
    name: string;
    slug: string;
};

type PaymentRecord = {
    id: number;
    txid: string | null;
    amount: number;
    status: string;
    billing_type: string | null;
    paid_at: string | null;
    created_at: string;
    plan: Plan | null;
};

type SubscriptionRecord = {
    id: number;
    status: string;
    billing_type: string | null;
    trial_ends_at: string | null;
    ends_at: string | null;
    created_at: string;
    plan: Plan | null;
};

type Tenant = {
    id: number;
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    is_active: boolean;
    subscription: {
        status: string;
        billing_type: string | null;
        trial_ends_at: string | null;
        ends_at: string | null;
        plan: Plan | null;
    } | null;
};

type PaginatedPayments = {
    data: PaymentRecord[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type PageProps = {
    tenant: Tenant;
    payments: PaginatedPayments;
    subscriptionHistory: SubscriptionRecord[];
    stats: {
        total_payments: number;
        successful_payments: number;
        pending_payments: number;
        total_spent: number;
        students_count: number;
        active_students_count: number;
        batches_count: number;
        active_batches_count: number;
        users_count: number;
        total_enrollments: number;
    };
};

export default function TenantDetail({ tenant, payments, subscriptionHistory, stats }: PageProps) {
    const { formatCurrency } = useLocale();

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return <Badge className="bg-green-600 text-white whitespace-nowrap">Success</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-600 text-white whitespace-nowrap">Pending</Badge>;
            case 'failed':
                return <Badge className="bg-red-600 text-white whitespace-nowrap">Failed</Badge>;
            case 'active':
                return <Badge className="bg-green-600 text-white whitespace-nowrap">Active</Badge>;
            case 'trial':
                return <Badge className="bg-blue-600 text-white whitespace-nowrap">Trial</Badge>;
            case 'expired':
                return <Badge className="bg-red-600 text-white whitespace-nowrap">Expired</Badge>;
            case 'cancelled':
                return <Badge variant="secondary" className="whitespace-nowrap">Cancelled</Badge>;
            default:
                return <Badge variant="secondary" className="whitespace-nowrap">{status}</Badge>;
        }
    };

    const paymentColumns = (() => {
        type Col = NonNullable<DataTableProps<PaymentRecord, unknown>['columns']>[number];

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
                id: 'billing_type',
                accessorKey: 'billing_type',
                header: 'Billing',
                enableSorting: false,
                cell: ({ row }: any) => (
                    <span className="capitalize">{row.original.billing_type ?? '—'}</span>
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

    const subscriptionColumns = (() => {
        type Col = NonNullable<DataTableProps<SubscriptionRecord, unknown>['columns']>[number];

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
                id: 'status',
                accessorKey: 'status',
                header: 'Status',
                enableSorting: false,
                cell: ({ row }: any) => getStatusBadge(row.original.status),
            } as Col,
            {
                id: 'billing_type',
                accessorKey: 'billing_type',
                header: 'Billing',
                enableSorting: false,
                cell: ({ row }: any) => (
                    <span className="capitalize">{row.original.billing_type ?? '—'}</span>
                ),
            } as Col,
            {
                id: 'ends_at',
                accessorKey: 'ends_at',
                header: 'Ends At',
                enableSorting: false,
                cell: ({ row }: any) =>
                    row.original.ends_at
                        ? new Date(row.original.ends_at).toLocaleDateString()
                        : '—',
            } as Col,
        ];
    })();

    const subscription = tenant.subscription;
    const isExpiringSoon = subscription?.ends_at && new Date(subscription.ends_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const isTrial = subscription?.status === 'trial';
    const isExpired = subscription?.status === 'expired' || (subscription?.ends_at && new Date(subscription.ends_at) < new Date());

    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <Link href="/super-admin/payments" className="size-8 inline-flex items-center justify-center rounded-md border hover:bg-accent">
                        <ArrowLeft className="size-4" />
                    </Link>
                    <Heading
                        title={tenant.name}
                        description={tenant.email ?? 'Coaching Center'}
                    />
                </div>

                {/* Subscription Status Card */}
                <Card>
                    <CardContent className="py-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                    <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-semibold">
                                            {subscription?.plan?.name ?? 'No Plan'}
                                        </h3>
                                        {getStatusBadge(subscription?.status ?? 'none')}
                                    </div>
                                    <p className="text-sm text-muted-foreground capitalize">
                                        {subscription?.billing_type ?? 'N/A'} billing
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                {subscription?.ends_at && (
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <CalendarClock className="size-3.5" />
                                            {isExpired ? 'Expired' : 'Expires'}
                                        </div>
                                        <div className={`font-semibold ${isExpiringSoon || isExpired ? 'text-red-600' : ''}`}>
                                            {new Date(subscription.ends_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}
                                {subscription?.trial_ends_at && (
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Clock className="size-3.5" />
                                            Trial Ends
                                        </div>
                                        <div className="font-semibold">
                                            {new Date(subscription.trial_ends_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                            <CreditCard className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{formatCurrency(stats.total_spent)}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.successful_payments} paid, {stats.pending_payments} pending
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Students</CardTitle>
                            <GraduationCap className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{stats.students_count}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.active_students_count} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Batches</CardTitle>
                            <Layers className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{stats.batches_count}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.active_batches_count} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Staff</CardTitle>
                            <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{stats.users_count}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.total_enrollments} total enrollments
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Payment & Subscription History */}
                <div className="grid gap-3 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={paymentColumns}
                                data={payments.data}
                                currentPage={payments.current_page}
                                lastPage={payments.last_page}
                                total={payments.total}
                                itemName="payments"
                                baseUrl={`/super-admin/tenants/${tenant.id}/detail`}
                                preserveParams={{}}
                                emptyMessage="No payments yet."
                                getRowId={(row) => String(row.id)}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={subscriptionColumns}
                                data={subscriptionHistory}
                                showPagination={false}
                                total={subscriptionHistory.length}
                                itemName="subscriptions"
                                emptyMessage="No subscription history."
                                getRowId={(row) => String(row.id)}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

TenantDetail.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/super-admin/dashboard' },
        { title: 'Payments', href: '/super-admin/payments' },
        { title: 'Tenant Detail' },
    ],
};