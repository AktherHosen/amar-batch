import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Mail, MailOpen, Plus, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/contexts/locale-context';
import { isParent } from '@/lib/role';
import messages from '@/routes/messages';

type MessageUser = {
    id: number;
    name: string;
};

type MessageStudent = {
    id: number;
    name: string;
};

type Message = {
    id: number;
    sender: MessageUser;
    receiver: MessageUser;
    student: MessageStudent | null;
    subject: string | null;
    body: string;
    read_at: string | null;
    created_at: string;
};

type PageProps = {
    auth: { user: { id: number; role: string } };
    messages: {
        data: Message[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    unreadCount: number;
    users: MessageUser[];
    students: MessageStudent[];
    filter: string;
};

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) {
        return 'just now';
    }

    if (seconds < 3600) {
        return Math.floor(seconds / 60) + 'm ago';
    }

    if (seconds < 86400) {
        return Math.floor(seconds / 3600) + 'h ago';
    }

    if (seconds < 604800) {
        return Math.floor(seconds / 86400) + 'd ago';
    }

    return date.toLocaleDateString();
}

export default function MessagesIndex({
    messages: pagination,
    unreadCount,
    users,
    students,
    filter,
}: PageProps) {
    const { t, formatDate } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const currentUserId = auth.user.id;
    const [sheetOpen, setSheetOpen] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: Message | null;
    }>({ open: false, item: null });

    const { data, setData, post, processing, reset } = useForm({
        receiver_id: '',
        student_id: '',
        subject: '',
        body: '',
    });

    const handleFilter = (value: string) => {
        router.get(
            messages.index().url,
            value === 'all' ? {} : { filter: value },
            { preserveState: true },
        );
    };

    const handleDelete = (msg: Message) => {
        setDeleteDialog({ open: true, item: msg });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(`/messages/${deleteDialog.item.id}`, {
                onSuccess: () => {
                    toast.success(t('messages.deleted'));
                    setDeleteDialog({ open: false, item: null });
                },
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(messages.store().url, {
            onSuccess: () => {
                setSheetOpen(false);
                reset();
                toast.success(t('messages.sent'));
                router.reload({ only: ['messages', 'unreadCount'] });
            },
        });
    };

    const userOptions = users.map((u) => ({
        value: String(u.id),
        label: u.name,
    }));

    const studentOptions = students.map((s) => ({
        value: String(s.id),
        label: s.name,
    }));

    const filters = [
        { key: 'all', label: t('messages.filter_all') },
        { key: 'sent', label: t('messages.filter_sent') },
        { key: 'received', label: t('messages.filter_received') },
        { key: 'unread', label: t('messages.filter_unread') },
    ];

    return (
        <>
            <Head title={t('messages.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title={t('messages.title')}
                        description={t('messages.desc')}
                    />
                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <Button size="sm">
                                <Plus className="mr-2 size-4" />
                                {t('messages.new')}
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-lg overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle>{t('messages.new')}</SheetTitle>
                                <SheetDescription>
                                    {t('messages.new_desc')}
                                </SheetDescription>
                            </SheetHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-4">
                                <div className="space-y-2">
                                    <Label>{t('messages.to')} *</Label>
                                    <SearchableSelect
                                        options={userOptions}
                                        value={data.receiver_id}
                                        onValueChange={(value) =>
                                            setData('receiver_id', value)
                                        }
                                        placeholder={t('messages.select_recipient')}
                                        emptyText={t('messages.select_recipient')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        {t('messages.related_student')}{' '}
                                        <span className="text-muted-foreground">
                                            ({t('messages.optional')})
                                        </span>
                                    </Label>
                                    <SearchableSelect
                                        options={studentOptions}
                                        value={data.student_id}
                                        onValueChange={(value) =>
                                            setData('student_id', value)
                                        }
                                        placeholder={t('messages.related_student')}
                                        emptyText={t('messages.related_student')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('messages.subject')}</Label>
                                    <Input
                                        value={data.subject}
                                        onChange={(e) =>
                                            setData('subject', e.target.value)
                                        }
                                        placeholder={t('messages.subject_placeholder')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('messages.body')} *</Label>
                                    <Textarea
                                        value={data.body}
                                        onChange={(e) =>
                                            setData('body', e.target.value)
                                        }
                                        placeholder={t('messages.body_placeholder')}
                                        rows={6}
                                    />
                                </div>
                            </form>
                            <SheetFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setSheetOpen(false)}
                                >
                                    {t('actions.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing || !data.receiver_id || !data.body}
                                    onClick={handleSubmit}
                                >
                                    <Send className="mr-2 size-4" />
                                    {processing ? t('actions.sending') : t('messages.send')}
                                </Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="flex flex-wrap gap-2">
                    {filters.map((f) => (
                        <Button
                            key={f.key}
                            variant={
                                (filter === 'all' && f.key === 'all') ||
                                filter === f.key
                                    ? 'default'
                                    : 'outline'
                            }
                            size="sm"
                            onClick={() => handleFilter(f.key)}
                        >
                            {f.label}
                            {f.key === 'unread' && unreadCount > 0 && (
                                <span className="ml-1.5 rounded-full bg-destructive px-1.5 py-0.5 text-xs text-destructive-foreground">
                                    {unreadCount}
                                </span>
                            )}
                        </Button>
                    ))}
                </div>

                <Card>
                    <CardContent className="pt-6">
                        {pagination.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Mail className="mb-4 size-12" />
                                <p>{t('messages.no_messages')}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {pagination.data.map((msg) => {
                                    const isSent = msg.sender.id === currentUserId;
                                    const otherUser = isSent ? msg.receiver : msg.sender;
                                    const isUnread = !msg.read_at && !isSent;

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex items-center gap-3 rounded-lg border p-4 transition-colors cursor-pointer ${
                                                isUnread ? 'bg-primary/5' : ''
                                            }`}
                                            onClick={() => {
                                                router.get(messages.show(msg.id).url);
                                            }}
                                        >
                                            <div className="mt-1 shrink-0">
                                                {isUnread ? (
                                                    <Mail className="size-5 text-primary" />
                                                ) : (
                                                    <MailOpen className="size-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p
                                                        className={`text-sm ${
                                                            isUnread
                                                                ? 'font-semibold text-foreground'
                                                                : 'text-muted-foreground'
                                                        }`}
                                                    >
                                                        {isSent
                                                            ? `${t('messages.to_label')} ${otherUser.name}`
                                                            : `${t('messages.from')} ${otherUser.name}`}
                                                    </p>
                                                    <span className="shrink-0 text-xs text-muted-foreground">
                                                        {timeAgo(msg.created_at)}
                                                    </span>
                                                </div>
                                                {msg.subject ? (
                                                    <p
                                                        className={`mt-0.5 truncate text-sm ${
                                                            isUnread
                                                                ? 'font-medium text-foreground'
                                                                : 'text-foreground'
                                                        }`}
                                                    >
                                                        {msg.subject}
                                                    </p>
                                                ) : (
                                                    <p
                                                        className={`mt-0.5 truncate text-sm ${
                                                            isUnread
                                                                ? 'font-medium text-foreground'
                                                                : 'text-foreground'
                                                        }`}
                                                    >
                                                        {msg.body.length > 100
                                                            ? msg.body.slice(0, 100) + '...'
                                                            : msg.body}
                                                    </p>
                                                )}
                                                {msg.student && (
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {msg.student.name}
                                                    </p>
                                                )}
                                            </div>
                                            {(isSent || isParent(auth.user)) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="size-8 shrink-0 p-0 text-destructive hover:text-destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(msg);
                                                    }}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {pagination.last_page > 1 && (
                            <Pagination
                                currentPage={pagination.current_page}
                                lastPage={pagination.last_page}
                                total={pagination.total}
                                perPage={pagination.per_page}
                                itemName="messages"
                                baseUrl={messages.index().url}
                                preserveParams={filter !== 'all' ? { filter } : {}}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    setDeleteDialog({ open, item: deleteDialog.item })
                }
                title={t('actions.delete')}
                description={`${t('actions.delete')} "${deleteDialog.item?.subject || deleteDialog.item?.body.slice(0, 50)}"?`}
                confirmText={t('actions.delete')}
                cancelText={t('actions.cancel')}
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

MessagesIndex.layout = {
    breadcrumbs: [{ title: 'Messages', href: messages.index().url }],
};
