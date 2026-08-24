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
                return <Badge className="bg-green-600 text-white whitespace-nowrap">{t('super_admin.active_payments')}</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-600 text-white whitespace-nowrap">{t('super_admin.pending')}</Badge>;
            case 'failed':
                return <Badge className="bg-red-600 text-white whitespace-nowrap">{t('super_admin.failed')}</Badge>;
            default:
                return <Badge variant="secondary" className="whitespace-nowrap">{status}</Badge>;
        }
    };

    const activeFilterCount = filters.status ? 1 : 0;

    const columns: NonNullable<DataTableProps<PaymentRecord, unknown>['columns']> = [
        {
            id: 'tenant',
            accessorKey: 'tenant',
            header: t('super_admin.coaching_centers'),
            enableSorting: false,
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
            id: 'txid',
            accessorKey: 'txid',
            header: 'TX ID',
            enableSorting: false,
            cell: ({ row }: any) => (
                <span className="font-mono text-xs">{row.original.txid ?? '—'}</span>
            ),
        },
        {
            id: 'amount',
            accessorKey: 'amount',
            header: t('super_admin.amount'),
            enableSorting: false,
            cell: ({ row }: any) => (
                <div className="text-right font-semibold">
                    {formatCurrency(row.original.amount)}
                </div>
            ),
        },
        {
            id: 'billing_type',
            accessorKey: 'billing_type',
            header: t('super_admin.billing'),
            enableSorting: false,
            cell: ({ row }: any) => (
                <span className="capitalize">{row.original.billing_type ?? '—'}</span>
            ),
        },
        {
            id: 'status',
            accessorKey: 'status',
            header: t('super_admin.status'),
            enableSorting: false,
            cell: ({ row }: any) => getStatusBadge(row.original.status),
        },
        {
            id: 'payment_method',
            accessorKey: 'payment_method',
            header: t('super_admin.method'),
            enableSorting: false,
            cell: ({ row }: any) => row.original.payment_method ?? '—',
        },
        {
            id: 'paid_at',
            accessorKey: 'paid_at',
            header: t('super_admin.paid_at'),
            enableSorting: false,
            cell: ({ row }: any) =>
                row.original.paid_at
                    ? new Date(row.original.paid_at).toLocaleDateString()
                    : '—',
        },
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
                                {t('super_admin.view_tenant')}
                            </DropdownMenuItem>
                            {payment.status === 'pending' && (
                                <>
                                    <DropdownMenuItem onClick={() => handleApprove(payment.id)}>
                                        <Check className="mr-2 size-4 text-green-600" />
                                        {t('super_admin.approve')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleCancel(payment.id)}>
                                        <Ban className="mr-2 size-4" />
                                        {t('super_admin.cancel')}
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-3 sm:p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title={t('super_admin.payments')}
                        description={t('super_admin.all_payments_description')}
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

                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-5">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">{t('super_admin.all')}</CardTitle>
                            <CreditCard className="size-3.5 text-muted-foreground sm:size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold sm:text-2xl">{stats.total}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">{t('super_admin.active_payments')}</CardTitle>
                            <CheckCircle className="size-3.5 text-green-600 sm:size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-green-600 sm:text-2xl">{stats.successful}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">{t('super_admin.pending')}</CardTitle>
                            <Clock className="size-3.5 text-yellow-600 sm:size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-yellow-600 sm:text-2xl">{stats.pending}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">{t('super_admin.failed')}</CardTitle>
                            <XCircle className="size-3.5 text-red-600 sm:size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-red-600 sm:text-2xl">{stats.failed}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">Revenue</CardTitle>
                            <TrendingUp className="size-3.5 text-muted-foreground sm:size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold sm:text-2xl">{formatCurrency(stats.total_revenue)}</div>
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
                            emptyMessage={t('super_admin.no_payments')}
                            getRowId={(row) => String(row.id)}
                            enableColumnVisibility={false}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder={`${t('actions.search')}...`}
                                    searchValue={search}
                                    onSearchChange={handleSearch}
                                    activeFilterCount={activeFilterCount}
                                    onClearAll={handleReset}
                                    filters={[
                                        {
                                            id: 'status',
                                            placeholder: t('super_admin.all_status'),
                                            value: filters.status ?? '',
                                            options: [
                                                { label: t('super_admin.active_payments'), value: 'success' },
                                                { label: t('super_admin.pending'), value: 'pending' },
                                                { label: t('super_admin.failed'), value: 'failed' },
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
