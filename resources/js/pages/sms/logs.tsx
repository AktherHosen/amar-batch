import { Head, router, usePage } from '@inertiajs/react';
import { MessageSquare, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';
import { DataTable } from '@/components/data-table';
import type { DataTableProps } from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import { RefreshButton } from '@/components/refresh-button';

type SmsLogItem = {
    id: number;
    recipient: string;
    message: string;
    type: string;
    status: string;
    created_at: string;
    user: { name: string } | null;
};

type PaginatedData = {
    data: SmsLogItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type PageProps = {
    logs: PaginatedData;
    stats: {
        total: number;
        sent: number;
        failed: number;
        today: number;
    };
    filters: {
        type?: string;
        status?: string;
        search?: string;
    };
};

export default function SmsLogs({ logs: pagination, stats, filters }: PageProps) {
    const { t } = useLocale();
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [type, setType] = useState(filters.type || '');
    const [refreshing, setRefreshing] = useState(false);

    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);

    const applyFilters = (newSearch: string, newStatus: string, newType: string) => {
        router.get(
            '/sms/logs',
            { search: newSearch, status: newStatus, type: newType },
            { preserveState: true }
        );
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        applyFilters(value, status, type);
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        applyFilters(search, value, type);
    };

    const handleTypeChange = (value: string) => {
        setType(value);
        applyFilters(search, status, value);
    };

    const clearAll = () => {
        setSearch('');
        setStatus('');
        setType('');
        router.get('/sms/logs', {}, { preserveState: true });
    };

    const getTypeBadge = (type: string) => {
        const variants: Record<string, string> = {
            manual: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            fee_reminder: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            absence_alert: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            exam_reminder: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        };
        return variants[type] || '';
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'success'> = {
            sent: 'success',
            failed: 'destructive',
            pending: 'secondary',
        };
        return variants[status] || 'secondary';
    };

    const activeFilterCount = (status ? 1 : 0) + (type ? 1 : 0);

    const columns = useMemo(() => {
        type Col = NonNullable<DataTableProps<SmsLogItem, unknown>['columns']>[number];

        return [
            {
                id: 'recipient',
                accessorKey: 'recipient',
                header: 'Recipient',
                enableSorting: false,
                meta: { sticky: true },
                cell: ({ row }: any) => <span className="whitespace-nowrap font-medium">{row.original.recipient}</span>,
            } as Col,
            {
                id: 'message',
                accessorKey: 'message',
                header: 'Message',
                enableSorting: false,
                cell: ({ row }: any) => <span className="max-w-[200px] truncate block text-muted-foreground">{row.original.message}</span>,
            } as Col,
            {
                id: 'type',
                accessorKey: 'type',
                header: 'Type',
                enableSorting: false,
                cell: ({ row }: any) => (
                    <span className={`whitespace-nowrap inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getTypeBadge(row.original.type)}`}>
                        {row.original.type.replace(/_/g, ' ')}
                    </span>
                ),
            } as Col,
            {
                id: 'status',
                accessorKey: 'status',
                header: 'Status',
                enableSorting: false,
                cell: ({ row }: any) => (
                    <Badge variant={getStatusBadge(row.original.status)} className="whitespace-nowrap">
                        {row.original.status}
                    </Badge>
                ),
            } as Col,
            {
                id: 'user',
                accessorKey: 'user.name',
                header: 'Sent By',
                enableSorting: false,
                cell: ({ row }: any) => <span className="whitespace-nowrap text-muted-foreground">{row.original.user?.name || '—'}</span>,
            } as Col,
            {
                id: 'created_at',
                accessorKey: 'created_at',
                header: 'Date',
                enableSorting: false,
                cell: ({ row }: any) => <span className="whitespace-nowrap text-muted-foreground">{new Date(row.original.created_at).toLocaleDateString()}</span>,
            } as Col,
        ];
    }, []);

    return (
        <>
            <Head title="SMS Logs" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <Heading title="SMS Logs" description="View all sent SMS messages" />
                    <RefreshButton
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            router.reload({
                                only: ['logs', 'stats'],
                                onFinish: () => setRefreshing(false),
                            });
                        }}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <MessageSquare className="size-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Sent</p>
                                <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                                <MessageSquare className="size-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Delivered</p>
                                <p className="text-2xl font-bold text-green-600">{stats.sent.toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                                <MessageSquare className="size-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Failed</p>
                                <p className="text-2xl font-bold text-red-600">{stats.failed.toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                                <MessageSquare className="size-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Today</p>
                                <p className="text-2xl font-bold">{stats.today.toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <DataTable
                            columns={columns}
                            data={pagination.data}
                            loading={refreshing}
                            currentPage={pagination.current_page}
                            lastPage={pagination.last_page}
                            total={pagination.total}
                            itemName="SMS logs"
                            baseUrl="/sms/logs"
                            preserveParams={{ search, status, type }}
                            emptyMessage="No SMS logs found"
                            getRowId={(row) => String(row.id)}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder="Search recipient or message..."
                                    searchValue={search}
                                    onSearchChange={handleSearch}
                                    activeFilterCount={activeFilterCount}
                                    onClearAll={clearAll}
                                    filters={[
                                        {
                                            id: 'status',
                                            placeholder: 'All Statuses',
                                            value: status,
                                            options: [
                                                { label: 'Sent', value: 'sent' },
                                                { label: 'Failed', value: 'failed' },
                                                { label: 'Pending', value: 'pending' },
                                            ],
                                            onValueChange: handleStatusChange,
                                        },
                                        {
                                            id: 'type',
                                            placeholder: 'All Types',
                                            value: type,
                                            options: [
                                                { label: 'Manual', value: 'manual' },
                                                { label: 'Fee Reminder', value: 'fee_reminder' },
                                                { label: 'Absence Alert', value: 'absence_alert' },
                                                { label: 'Exam Reminder', value: 'exam_reminder' },
                                            ],
                                            onValueChange: handleTypeChange,
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

SmsLogs.layout = {
    breadcrumbs: [
        {
            title: 'SMS Logs',
            href: '/sms/logs',
        },
    ],
};
