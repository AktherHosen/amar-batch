import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CreditCard, TrendingUp, Clock, CheckCircle, XCircle, EllipsisVertical, Check, Ban, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table';
import type { DataTableProps } from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import Heading from '@/components/heading';
import { RefreshButton } from '@/components/refresh-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
    gateway_response: Record<string, any> | null;
    tenant: { name: string } | null;
    plan: { name: string } | null;
};

type Stats = {
    total: number;
    successful: number;
    pending: number;
    failed: number;
    cancelled: number;
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
    filters: { status?: string; search?: string; method?: string };
};

export default function SuperAdminPayments({ payments, stats, filters }: PageProps) {
    const { formatCurrency, t } = useLocale();
    const [search, setSearch] = useState(filters.search ?? '');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get('/dashboard/payments', { search: value, status: filters.status ?? 'all', method: filters.method ?? 'all' }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        router.get('/dashboard/payments', {}, { preserveState: true });
    };

    const handleStatusFilter = (value: string) => {
        router.get('/dashboard/payments', { status: value || undefined, search, method: filters.method ?? 'all' }, { preserveState: true });
    };

    const handleMethodFilter = (value: string) => {
        router.get('/dashboard/payments', { method: value || undefined, status: filters.status ?? 'all', search }, { preserveState: true });
    };

    const handleApprove = (paymentId: number) => {
        router.post(`/dashboard/payments/${paymentId}/approve`, {}, {
            onSuccess: () => toast.success(t('toast.approved_successfully')),
        });
    };

    const handleCancel = (paymentId: number) => {
        router.post(`/dashboard/payments/${paymentId}/cancel`, {}, {
            onSuccess: () => toast.success(t('toast.cancelled_successfully')),
        });
    };

    const handleReject = (paymentId: number) => {
        router.post(`/dashboard/payments/${paymentId}/reject`, {}, {
            onSuccess: () => toast.success(t('toast.rejected_successfully')),
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return <Badge className="bg-green-600 text-white whitespace-nowrap">{t('super_admin.success')}</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-600 text-white whitespace-nowrap">{t('super_admin.pending')}</Badge>;
            case 'failed':
                return <Badge className="bg-red-600 text-white whitespace-nowrap">{t('super_admin.failed')}</Badge>;
            case 'cancelled':
                return <Badge variant="secondary" className="whitespace-nowrap">{t('super_admin.cancelled')}</Badge>;
            default:
                return <Badge variant="secondary" className="whitespace-nowrap">{status}</Badge>;
        }
    };

    const getMethodLabel = (method: string | null) => {
        if (method === 'manual') return t('super_admin.manual');
        if (method) return method;
        return '—';
    };

    const activeFilterCount = [
        filters.status && filters.status !== 'all' ? 1 : 0,
        filters.method && filters.method !== 'all' ? 1 : 0,
    ].reduce((a, b) => a + b, 0);

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
                <Badge variant="outline" className="capitalize whitespace-nowrap">
                    {row.original.billing_type ?? '—'}
                </Badge>
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
            cell: ({ row }: any) => (
                <Badge variant="outline" className="whitespace-nowrap">
                    {getMethodLabel(row.original.payment_method)}
                </Badge>
            ),
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
                            <DropdownMenuItem onClick={() => { setSelectedPayment(payment); setDetailOpen(true); }}>
                                <Eye className="mr-2 size-4" />
                                {t('super_admin.view_details')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.get(`/dashboard/tenants/${payment.tenant_id}/detail`)}>
                                <EyeOff className="mr-2 size-4" />
                                {t('super_admin.view_tenant')}
                            </DropdownMenuItem>
                            {payment.status === 'pending' && (
                                <>
                                    <DropdownMenuItem onClick={() => handleApprove(payment.id)}>
                                        <Check className="mr-2 size-4 text-green-600" />
                                        {t('super_admin.approve')}
                                    </DropdownMenuItem>
                                    {payment.payment_method === 'manual' ? (
                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleReject(payment.id)}>
                                            <Ban className="mr-2 size-4" />
                                            {t('super_admin.reject')}
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleCancel(payment.id)}>
                                            <Ban className="mr-2 size-4" />
                                            {t('super_admin.cancel')}
                                        </DropdownMenuItem>
                                    )}
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden rounded-xl p-3 sm:p-4"
        >
            <div className="flex items-start justify-between">
                <Heading
                    title={t('super_admin.payments')}
                    description={t('super_admin.all_payments_description')}
                />
                <RefreshButton
                    refreshing={refreshing}
                    onRefresh={() => {
                        setRefreshing(true);
                        router.reload({ onFinish: () => setRefreshing(false) });
                    }}
                />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
                {[
                    { label: t('super_admin.successful'), value: stats.successful, icon: CheckCircle, color: 'text-green-600' },
                    { label: t('super_admin.pending'), value: stats.pending, icon: Clock, color: 'text-yellow-600' },
                    { label: t('super_admin.failed'), value: stats.failed, icon: XCircle, color: 'text-red-600' },
                    { label: t('super_admin.total_revenue'), value: formatCurrency(stats.total_revenue), icon: TrendingUp, color: 'text-muted-foreground' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">{stat.label}</CardTitle>
                                <stat.icon className={`size-3.5 ${stat.color} sm:size-4`} />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-xl font-bold sm:text-2xl ${stat.color}`}>{stat.value}</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
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
                        preserveParams={{ search, status: filters.status ?? '', method: filters.method ?? '' }}
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
                                        id: 'method',
                                        placeholder: t('super_admin.all_methods'),
                                        value: filters.method ?? '',
                                        options: [
                                            { label: t('super_admin.gateway'), value: 'gateway' },
                                            { label: t('super_admin.manual'), value: 'manual' },
                                        ],
                                        onValueChange: handleMethodFilter,
                                    },
                                    {
                                        id: 'status',
                                        placeholder: t('super_admin.all_status'),
                                        value: filters.status ?? '',
                                        options: [
                                            { label: t('super_admin.successful'), value: 'success' },
                                            { label: t('super_admin.pending'), value: 'pending' },
                                            { label: t('super_admin.failed'), value: 'failed' },
                                            { label: t('super_admin.cancelled'), value: 'cancelled' },
                                        ],
                                        onValueChange: handleStatusFilter,
                                    },
                                ]}
                            />
                        }
                    />
                </CardContent>
            </Card>

            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('super_admin.payment_details')}</DialogTitle>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('super_admin.coaching_center')}</span>
                                <span className="font-medium">{selectedPayment.tenant?.name || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('super_admin.plan_name')}</span>
                                <span className="font-medium">{selectedPayment.plan?.name || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('super_admin.amount')}</span>
                                <span className="font-semibold">{formatCurrency(selectedPayment.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('super_admin.billing')}</span>
                                <Badge variant="outline" className="capitalize">{selectedPayment.billing_type}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('super_admin.status')}</span>
                                {getStatusBadge(selectedPayment.status)}
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('super_admin.method')}</span>
                                <Badge variant="outline">{getMethodLabel(selectedPayment.payment_method)}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">TX ID</span>
                                <span className="font-mono text-xs">{selectedPayment.txid || '—'}</span>
                            </div>
                            {selectedPayment.payment_method === 'manual' && selectedPayment.gateway_response && (
                                <>
                                    {selectedPayment.gateway_response.transaction_id && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t('super_admin.transaction_id')}</span>
                                            <span className="font-mono text-xs">{selectedPayment.gateway_response.transaction_id}</span>
                                        </div>
                                    )}
                                    {selectedPayment.gateway_response.sender_number && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t('super_admin.sender_number')}</span>
                                            <span>{selectedPayment.gateway_response.sender_number}</span>
                                        </div>
                                    )}
                                    {selectedPayment.gateway_response.notes && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t('super_admin.notes')}</span>
                                            <span className="text-right">{selectedPayment.gateway_response.notes}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('super_admin.submitted_at')}</span>
                                        <span>{new Date(selectedPayment.created_at).toLocaleString()}</span>
                                    </div>
                                </>
                            )}
                            {selectedPayment.paid_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('super_admin.paid_at')}</span>
                                    <span>{new Date(selectedPayment.paid_at).toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
