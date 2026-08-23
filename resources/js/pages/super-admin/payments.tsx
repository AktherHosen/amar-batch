import { router } from '@inertiajs/react';
import { CreditCard, TrendingUp, Clock, CheckCircle, XCircle, EllipsisVertical, Check, Ban, Eye } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DataTable  } from '@/components/data-table';
import type {DataTableProps} from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import Heading from '@/components/heading';
import { RefreshButton } from '@/components/refresh-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLocale } from '@/contexts/locale-context';

type PaymentRecord = {
    id: number;
    tenant_id: number;
    txid: string | null;
    amount: number;
    status: string;
    payment_method: string | null;
    billing_type: string | null;
    paid_at: string | null;
    created_at: string;
    tenant: { name: string } | null;
    plan: { name: string } | null;
};

type Stats = {
    total: number;
    successful: number;
    pending: number;
    failed: number;
    total_revenue: number;
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
    payments: PaginatedPayments;
    stats: Stats;
    filters: { status?: string; search?: string };
};

export default function SuperAdminPayments({ payments, stats, filters }: PageProps) {
    const { formatCurrency, t } = useLocale();
    const [search, setSearch] = useState(filters.search ?? '');
    const [refreshing, setRefreshing] = useState(false);

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get('/dashboard/payments', { search: value, status: filters.status ?? 'all' }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        router.get('/dashboard/payments', {}, { preserveState: true });
    };

    const handleStatusFilter = (value: string) => {
        router.get('/dashboard/payments', { status: value || undefined, search }, { preserveState: true });
    };

    const handleApprove = (paymentId: number) => {
        router.post(`/dashboard/payments/${paymentId}/approve`, {}, {
            onSuccess: () => toast.success(t('toast.approved_successfully')),
        });
    };

    const handleCancel = (paymentId: number) => {
        router.post(`/dashboard/payments/${paymentId}/cancel`, {}, {
            onSuccess: () => toast.success(t('toast.deleted_successfully')),
        });
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

    const activeFilterCount = filters.status ? 1 : 0;

    const columns = (() => {
        type Col = NonNullable<DataTableProps<PaymentRecord, unknown>['columns']>[number];

        return [
            {
                id: 'tenant',
                accessorKey: 'tenant',
                header: 'Tenant',
                enableSorting: false,
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
                id: 'txid',
                accessorKey: 'txid',
                header: 'TX ID',
                enableSorting: false,
                cell: ({ row }: any) => (
                    <span className="font-mono text-xs">{row.original.txid ?? '—'}</span>
                ),
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
            {
                id: 'payment_method',
                accessorKey: 'payment_method',
                header: 'Method',
                enableSorting: false,
                cell: ({ row }: any) => row.original.payment_method ?? '—',
            } as Col,
            {
                id: 'paid_at',
                accessorKey: 'paid_at',
                header: 'Paid At',
                enableSorting: false,
                cell: ({ row }: any) =>
                    row.original.paid_at
                        ? new Date(row.original.paid_at).toLocaleDateString()
                        : '—',
            } as Col,
            {
                id: 'actions',
                header: '',
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }: any) => {
                    const payment: PaymentRecord = row.original;

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="size-8 p-0">
                                    <EllipsisVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.get(`/dashboard/tenants/${payment.tenant_id}/detail`)}>
                                    <Eye className="mr-2 size-4" />
                                    View Tenant
                                </DropdownMenuItem>
                                {payment.status === 'pending' && (
                                    <>
                                        <DropdownMenuItem onClick={() => handleApprove(payment.id)}>
                                            <Check className="mr-2 size-4 text-green-600" />
                                            Approve
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleCancel(payment.id)}>
                                            <Ban className="mr-2 size-4" />
                                            Cancel
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            } as Col,
        ];
    })();

    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title="Payment History"
                        description="All transactions across coaching centers"
                    />
                    <div className="flex items-center gap-1">
                        <RefreshButton
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                router.reload({ onFinish: () => setRefreshing(false) });
                            }}
                        />
                    </div>
                </div>

                <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                            <CreditCard className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Successful</CardTitle>
                            <CheckCircle className="size-4 text-green-600" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="size-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Failed</CardTitle>
                            <XCircle className="size-4 text-red-600" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                            <TrendingUp className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <DataTable
                            columns={columns}
                            data={payments.data}
                            loading={refreshing}
                            currentPage={payments.current_page}
                            lastPage={payments.last_page}
                            total={payments.total}
                            itemName="payments"
                            baseUrl="/dashboard/payments"
                            preserveParams={{ search, status: filters.status ?? '' }}
                            emptyMessage="No payments found."
                            getRowId={(row) => String(row.id)}
                            enableColumnVisibility={false}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder="Search tenant or TX ID..."
                                    searchValue={search}
                                    onSearchChange={handleSearch}
                                    activeFilterCount={activeFilterCount}
                                    onClearAll={handleReset}
                                    filters={[
                                        {
                                            id: 'status',
                                            placeholder: 'All Status',
                                            value: filters.status ?? '',
                                            options: [
                                                { label: 'Success', value: 'success' },
                                                { label: 'Pending', value: 'pending' },
                                                { label: 'Failed', value: 'failed' },
                                            ],
                                            onValueChange: handleStatusFilter,
                                        },
                                    ]}
                                />
                            }
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
