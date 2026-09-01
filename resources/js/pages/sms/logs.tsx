import { Head, router, usePage } from '@inertiajs/react';
import { MessageSquare, Search, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLocale } from '@/contexts/locale-context';

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

export default function SmsLogs({ logs, stats, filters }: PageProps) {
    const { t } = useLocale();
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [search, setSearch] = useState(filters.search || '');

    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);

    const applyFilter = (key: string, value: string) => {
        const params = new URLSearchParams(window.location.search);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete('page');
        router.get(`/sms/logs?${params.toString()}`);
    };

    const handleSearch = () => {
        applyFilter('search', search);
    };

    const resetFilters = () => {
        setSearch('');
        router.get('/sms/logs');
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

    return (
        <>
            <Head title="SMS Logs" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading title="SMS Logs" description="View all sent SMS messages" />

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
                    <CardHeader>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <MessageSquare className="size-4 text-muted-foreground" />
                                Messages
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    {['', 'sent', 'failed'].map((status) => (
                                        <Button
                                            key={status}
                                            variant={filters.status === status || (!filters.status && !status) ? 'default' : 'outline'}
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => applyFilter('status', status)}
                                        >
                                            {status || 'All'}
                                        </Button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search..."
                                        className="h-7 w-40 pl-8 text-xs"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                                {(filters.search || filters.type || filters.status) && (
                                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={resetFilters}>
                                        <X className="size-3" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="whitespace-nowrap">Recipient</TableHead>
                                        <TableHead className="whitespace-nowrap">Message</TableHead>
                                        <TableHead className="whitespace-nowrap">Type</TableHead>
                                        <TableHead className="whitespace-nowrap">Status</TableHead>
                                        <TableHead className="whitespace-nowrap">Sent By</TableHead>
                                        <TableHead className="whitespace-nowrap">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.data.length > 0 ? (
                                        logs.data.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="whitespace-nowrap font-medium">{log.recipient}</TableCell>
                                                <TableCell className="max-w-[200px] truncate text-muted-foreground">{log.message}</TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getTypeBadge(log.type)}`}>
                                                        {log.type.replace(/_/g, ' ')}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    <Badge variant={getStatusBadge(log.status)}>{log.status}</Badge>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap text-muted-foreground">{log.user?.name || '—'}</TableCell>
                                                <TableCell className="whitespace-nowrap text-muted-foreground">
                                                    {new Date(log.created_at).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                No SMS logs found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {logs.last_page > 1 && (
                            <Pagination
                                currentPage={logs.current_page}
                                lastPage={logs.last_page}
                                total={logs.total}
                                perPage={logs.per_page}
                                itemName="SMS logs"
                                baseUrl="/sms/logs"
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
