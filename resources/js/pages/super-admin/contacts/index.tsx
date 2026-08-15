import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Mail, MailOpen, MessageSquareReply, RefreshCw, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

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
    const [search, setSearch] = useState(filters.search || '');
    const [refreshing, setRefreshing] = useState(false);
    const [replyDialog, setReplyDialog] = useState<{ open: boolean; message: ContactMessage | null; reply: string }>({
        open: false,
        message: null,
        reply: '',
    });
    const [sending, setSending] = useState(false);

    const handleSearch = () => {
        router.get('/super-admin/contacts', { search, status: filters.status }, { preserveState: true });
    };

    const resetFilters = () => {
        setSearch('');
        router.get('/super-admin/contacts', {});
    };

    const markRead = (message: ContactMessage) => {
        if (message.is_read) return;
        router.post(`/super-admin/contacts/${message.id}/read`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Message marked as read.'),
        });
    };

    const openReply = (message: ContactMessage) => {
        setReplyDialog({ open: true, message, reply: message.reply || '' });
    };

    const sendReply = () => {
        if (!replyDialog.message || !replyDialog.reply.trim()) return;

        setSending(true);
        router.post(`/super-admin/contacts/${replyDialog.message.id}/reply`, {
            reply: replyDialog.reply,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Reply sent successfully.');
                setReplyDialog({ open: false, message: null, reply: '' });
            },
            onFinish: () => setSending(false),
        });
    };

    return (
        <>
            <Head title="Contact Messages" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden rounded-xl p-3 sm:p-4">
                <Heading
                    title="Contact Messages"
                    description="Messages submitted through the contact form"
                />

                <div className="grid grid-cols-3 gap-3">
                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                            <Mail className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Unread</CardTitle>
                            <MailOpen className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{stats.unread}</div>
                        </CardContent>
                    </Card>
                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Replied</CardTitle>
                            <MessageSquareReply className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{stats.replied}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle>Inbox</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={filters.status === 'unread' ? 'bg-muted' : ''}
                                    onClick={() =>
                                        router.get('/super-admin/contacts', { status: filters.status === 'unread' ? undefined : 'unread', search }, { preserveState: true })
                                    }
                                >
                                    {filters.status === 'unread' ? 'All' : 'Unread'}
                                </Button>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="Search name, email, subject..."
                                        className="h-8 w-48 pl-8 sm:w-64"
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => { setSearch(''); router.get('/super-admin/contacts', { status: filters.status }, { preserveState: true }); }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    onClick={() => {
                                        setRefreshing(true);
                                        router.reload({ onFinish: () => setRefreshing(false) });
                                    }}
                                >
                                    <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {pagination.total > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="whitespace-nowrap">Name</TableHead>
                                        <TableHead className="whitespace-nowrap">Email</TableHead>
                                        <TableHead className="whitespace-nowrap">Subject</TableHead>
                                        <TableHead className="whitespace-nowrap">Status</TableHead>
                                        <TableHead className="whitespace-nowrap">Received</TableHead>
                                        <TableHead className="whitespace-nowrap w-[90px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pagination.data.map((message) => (
                                        <TableRow key={message.id} className={message.is_read ? '' : 'bg-muted/40'}>
                                            <TableCell className="font-medium whitespace-nowrap">{message.name}</TableCell>
                                            <TableCell className="whitespace-nowrap">{message.email}</TableCell>
                                            <TableCell className="max-w-[240px] truncate whitespace-nowrap">{message.subject}</TableCell>
                                            <TableCell>
                                                {!message.is_read ? (
                                                    <Badge className="bg-yellow-600 text-white whitespace-nowrap">Unread</Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="whitespace-nowrap">
                                                        {message.replied_at ? 'Replied' : 'Read'}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {new Date(message.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="w-[90px]">
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
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="py-8 text-center text-sm text-muted-foreground">No contact messages yet.</p>
                        )}
                    </CardContent>
                </Card>

                {pagination.last_page > 1 && (
                    <Pagination
                        currentPage={pagination.current_page}
                        lastPage={pagination.last_page}
                        total={pagination.total}
                        perPage={pagination.per_page}
                        itemName="messages"
                        baseUrl="/super-admin/contacts"
                        preserveParams={{ search: filters.search, status: filters.status }}
                    />
                )}

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

ContactMessagesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/super-admin/dashboard' },
        { title: 'Contact Messages', href: '/super-admin/contacts' },
    ],
};