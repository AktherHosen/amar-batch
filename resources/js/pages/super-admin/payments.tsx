import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, X, RefreshCw, CreditCard, TrendingUp, Clock, CheckCircle, XCircle, EllipsisVertical, Check, Ban, Eye } from 'lucide-react';
import { useLocale } from '@/contexts/locale-context';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

type PaymentRecord = {
    id: number;
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

    const handleSearch = () => {
        router.get('/super-admin/payments', { search, status: filters.status ?? 'all' }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        router.get('/super-admin/payments', { status: 'all' }, { preserveState: true });
    };

    const handleStatusFilter = (status: string) => {
        router.get('/super-admin/payments', { status, search }, { preserveState: true });
    };

    const handleApprove = (paymentId: number) => {
        router.post(`/super-admin/payments/${paymentId}/approve`, {}, {
            onSuccess: () => toast.success(t('toast.approved_successfully')),
        });
    };

    const handleCancel = (paymentId: number) => {
        router.post(`/super-admin/payments/${paymentId}/cancel`, {}, {
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

    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    title="Payment History"
                    description="All transactions across coaching centers"
                />

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

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        {['all', 'success', 'pending', 'failed'].map((status) => (
                            <Button
                                key={status}
                                variant={(filters.status ?? 'all') === status ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusFilter(status)}
                                className="capitalize"
                            >
                                {status}
                            </Button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tenant or TX ID..."
                                className="pl-8 w-[250px]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Button variant="ghost" size="sm" className="size-8 p-0" onClick={handleSearch}>
                            <RefreshCw className="size-4" />
                        </Button>
                        {(filters.search || (filters.status && filters.status !== 'all')) && (
                            <Button variant="ghost" size="sm" className="size-8 p-0" onClick={handleReset}>
                                <X className="size-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="whitespace-nowrap sticky left-0 bg-background z-10 min-w-[150px]">Tenant</TableHead>
                                    <TableHead className="whitespace-nowrap">Plan</TableHead>
                                    <TableHead className="whitespace-nowrap">TX ID</TableHead>
                                    <TableHead className="whitespace-nowrap text-right">Amount</TableHead>
                                    <TableHead className="whitespace-nowrap">Billing</TableHead>
                                    <TableHead className="whitespace-nowrap">Status</TableHead>
                                    <TableHead className="whitespace-nowrap">Method</TableHead>
                                    <TableHead className="whitespace-nowrap">Paid At</TableHead>
                                    <TableHead className="whitespace-nowrap w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.data.length > 0 ? (
                                    payments.data.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="font-medium whitespace-nowrap sticky left-0 bg-background z-10">
                                                {payment.tenant?.name ?? '—'}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{payment.plan?.name ?? '—'}</TableCell>
                                            <TableCell className="whitespace-nowrap font-mono text-xs">{payment.txid ?? '—'}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap font-semibold">
                                                {formatCurrency(payment.amount)}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap capitalize">{payment.billing_type ?? '—'}</TableCell>
                                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                            <TableCell className="whitespace-nowrap">{payment.payment_method ?? '—'}</TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {payment.paid_at
                                                    ? new Date(payment.paid_at).toLocaleDateString()
                                                    : '—'}
                                            </TableCell>
                                            <TableCell className="w-[50px]">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="size-8 p-0">
                                                            <EllipsisVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => router.get(`/super-admin/tenants/${payment.tenant_id}/detail`)}>
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
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                            No payments found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {payments.last_page > 1 && (
                    <Pagination
                        currentPage={payments.current_page}
                        lastPage={payments.last_page}
                        onPageChange={(page) =>
                            router.get('/super-admin/payments', { page, status: filters.status ?? 'all', search }, { preserveState: true })
                        }
                    />
                )}
            </div>
        </>
    );
}

SuperAdminPayments.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/super-admin/dashboard' },
        { title: 'Payments', href: '/super-admin/payments' },
    ],
};
