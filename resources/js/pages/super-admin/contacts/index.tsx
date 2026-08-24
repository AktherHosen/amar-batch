import { Head, router } from '@inertiajs/react';
import { Mail, MailOpen, MessageSquareReply } from 'lucide-react';
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
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/contexts/locale-context';

type ContactMessage = {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    reply: string | null;
    replied_at: string | null;
    is_read: boolean;
    created_at: string;
};

type PageProps = {
    messages: {
        data: ContactMessage[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total: number;
        unread: number;
        replied: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
};

export default function ContactMessagesIndex({ messages: pagination, stats, filters }: PageProps) {
    const { t } = useLocale();
    const [search, setSearch] = useState(filters.search || '');
    const [refreshing, setRefreshing] = useState(false);
    const [replyDialog, setReplyDialog] = useState<{ open: boolean; message: ContactMessage | null; reply: string }>({
        open: false,
        message: null,
        reply: '',
    });
    const [sending, setSending] = useState(false);

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get('/dashboard/contacts', { search: value, status: filters.status }, { preserveState: true });
    };

    const resetFilters = () => {
        setSearch('');
        router.get('/dashboard/contacts', {});
    };

    const markRead = (message: ContactMessage) => {
        if (message.is_read) {
return;
}

        router.post(`/dashboard/contacts/${message.id}/read`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(t('toast.updated_successfully')),
        });
    };

    const openReply = (message: ContactMessage) => {
        setReplyDialog({ open: true, message, reply: message.reply || '' });
    };

    const sendReply = () => {
        if (!replyDialog.message || !replyDialog.reply.trim()) {
return;
}

        setSending(true);
        router.post(`/dashboard/contacts/${replyDialog.message.id}/reply`, {
            reply: replyDialog.reply,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('toast.updated_successfully'));
                setReplyDialog({ open: false, message: null, reply: '' });
            },
            onFinish: () => setSending(false),
        });
    };

    const activeFilterCount = filters.status === 'unread' ? 1 : 0;

    const columns: NonNullable<DataTableProps<ContactMessage, unknown>['columns']> = [
        {
            id: 'name',
            accessorKey: 'name',
            header: t('super_admin.name'),
            enableSorting: true,
            meta: { sticky: true },
            cell: ({ row }: any) => (
                <span className="font-medium">{row.original.name}</span>
            ),
        },
        {
            id: 'email',
            accessorKey: 'email',
            header: t('super_admin.email'),
            enableSorting: false,
            cell: ({ row }: any) => row.original.email,
        },
        {
            id: 'subject',
            accessorKey: 'subject',
            header: t('super_admin.subject'),
            enableSorting: false,
            cell: ({ row }: any) => (
                <span className="block max-w-[240px] truncate">{row.original.subject}</span>
            ),
        },
        {
            id: 'status',
            accessorKey: 'is_read',
            header: t('super_admin.status'),
            enableSorting: false,
            cell: ({ row }: any) => {
                const message: ContactMessage = row.original;

                return !message.is_read ? (
                    <Badge className="bg-yellow-600 text-white whitespace-nowrap">{t('super_admin.unread')}</Badge>
                ) : (
                    <Badge variant="secondary" className="whitespace-nowrap">
                        {message.replied_at ? t('super_admin.replied') : t('super_admin.active')}
                    </Badge>
                );
            },
        },
        {
            id: 'created_at',
            accessorKey: 'created_at',
            header: t('super_admin.received'),
            enableSorting: false,
            cell: ({ row }: any) =>
                new Date(row.original.created_at).toLocaleDateString(),
        },
        {
            id: 'actions',
            header: '',
            enableSorting: false,
            enableHiding: false,
            cell: ({ row }: any) => {
                const message: ContactMessage = row.original;

                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0"
                        onClick={() => {
                            markRead(message);
                            openReply(message);
                        }}
                    >
                        <MessageSquareReply className="size-4" />
                    </Button>
                );
            },
        },
    ];

    return (
        <>
            <Head title={t('super_admin.contacts')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden rounded-xl p-3 sm:p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title={t('super_admin.contacts')}
                        description={t('super_admin.all_contacts_description')}
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

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">{t('super_admin.all')}</CardTitle>
                            <Mail className="size-3.5 text-muted-foreground sm:size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold sm:text-2xl">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">{t('super_admin.unread')}</CardTitle>
                            <MailOpen className="size-3.5 text-muted-foreground sm:size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold sm:text-2xl">{stats.unread}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">{t('super_admin.replied')}</CardTitle>
                            <MessageSquareReply className="size-3.5 text-muted-foreground sm:size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold sm:text-2xl">{stats.replied}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('super_admin.contacts')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={pagination.data}
                            loading={refreshing}
                            currentPage={pagination.current_page}
                            lastPage={pagination.last_page}
                            total={pagination.total}
                            itemName="messages"
                            baseUrl="/dashboard/contacts"
                            preserveParams={{ search, status: filters.status }}
                            emptyMessage={t('super_admin.no_contacts')}
                            getRowId={(row) => String(row.id)}
                            enableColumnVisibility={false}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder={`${t('actions.search')}...`}
                                    searchValue={search}
                                    onSearchChange={handleSearch}
                                    activeFilterCount={activeFilterCount}
                                    onClearAll={resetFilters}
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={filters.status === 'unread' ? 'bg-muted' : ''}
                                        onClick={() =>
                                            router.get('/dashboard/contacts', { status: filters.status === 'unread' ? undefined : 'unread', search }, { preserveState: true })
                                        }
                                    >
                                        {filters.status === 'unread' ? t('super_admin.all') : t('super_admin.unread')}
                                    </Button>
                                </FilterBar>
                            }
                        />
                    </CardContent>
                </Card>

                {/* Reply Dialog */}
                <Dialog
                    open={replyDialog.open}
                    onOpenChange={(open) => setReplyDialog({ ...replyDialog, open, reply: open ? replyDialog.reply : '' })}
                >
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Reply to {replyDialog.message?.name}</DialogTitle>
                        </DialogHeader>
                        {replyDialog.message && (
                            <div className="space-y-4">
                                <div className="rounded-lg border bg-muted/40 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Subject: {replyDialog.message.subject}
                                    </p>
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                                        {replyDialog.message.message}
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="reply">Reply to {replyDialog.message.email}</Label>
                                    <Textarea
                                        id="reply"
                                        rows={5}
                                        value={replyDialog.reply}
                                        onChange={(e) => setReplyDialog({ ...replyDialog, reply: e.target.value })}
                                        placeholder="Type your reply..."
                                    />
                                </div>
                                {replyDialog.message.reply && (
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm dark:border-green-800 dark:bg-green-950/40">
                                        <p className="font-semibold text-green-700 dark:text-green-400">Previous reply sent</p>
                                        <p className="mt-1 whitespace-pre-wrap text-green-800 dark:text-green-300">
                                            {replyDialog.message.reply}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setReplyDialog({ open: false, message: null, reply: '' })}
                            >
                                Cancel
                            </Button>
                            <Button onClick={sendReply} disabled={sending || !replyDialog.reply.trim()}>
                                {sending ? 'Sending...' : 'Send Reply'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
