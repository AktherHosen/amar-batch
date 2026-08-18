import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';
import { isOwner } from '@/lib/role';
import notices from '@/routes/notices';

type Notice = {
    id: number;
    title: string;
    content: string;
    batch: { id: number; name: string } | null;
    creator: { id: number; name: string };
    is_active: boolean;
    published_at: string | null;
    created_at: string;
};

type PageProps = {
    auth: { user: { role: string } };
    notice: Notice;
};

export default function NoticesShow() {
    const { notice } = usePage<PageProps>().props;
    const { auth } = usePage<PageProps>().props;
    const { t } = useLocale();
    const isAdmin = isOwner(auth.user);
    const [deleteDialog, setDeleteDialog] = useState(false);

    const handleDelete = () => {
        setDeleteDialog(true);
    };

    const confirmDelete = () => {
        router.delete(notices.destroy(notice.id), {
            onSuccess: () => {
                toast.success(t('toast.deleted_successfully'));
                router.visit(notices.index().url);
            },
        });
        setDeleteDialog(false);
    };

    return (
        <>
            <Head title={notice.title} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex min-w-0 items-center justify-between">
                    <div className="flex min-w-0 items-center gap-2">
                        <Link href={notices.index()} className="shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-9"
                            >
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <h1 className="truncate text-lg font-bold tracking-tight sm:text-2xl">
                            {notice.title}
                        </h1>
                    </div>
                    {isAdmin && (
                        <div className="flex shrink-0 gap-2">
                            <Link href={notices.edit(notice.id)}>
                                <Button variant="outline" className="h-9">
                                    <Pencil className="size-4" />
                                    <span className="ml-2 hidden sm:inline">{t('actions.edit')}</span>
                                </Button>
                            </Link>
                            <Button
                                variant="destructive"
                                className="h-9"
                                onClick={handleDelete}
                            >
                                <Trash2 className="size-4" />
                                <span className="ml-2 hidden sm:inline">{t('actions.delete')}</span>
                            </Button>
                        </div>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('notices.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Status
                                </p>
                                <Badge
                                    variant={
                                        notice.is_active
                                            ? 'success'
                                            : 'secondary'
                                    }
                                >
                                    {notice.is_active ? 'Active' : 'Draft'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Audience
                                </p>
                                {notice.batch ? (
                                    <Badge variant="secondary">
                                        {notice.batch.name}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">Center-wide</Badge>
                                )}
                            </div>
                            {notice.published_at && (
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Published
                                    </p>
                                    <p className="text-sm font-medium">
                                        {new Date(
                                            notice.published_at,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Created by
                                </p>
                                <p className="text-sm font-medium">
                                    {notice.creator.name}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 border-t pt-4">
                            <div className="prose max-w-none text-sm whitespace-pre-wrap">
                                {notice.content}
                            </div>
                        </div>

                        <div className="mt-4 border-t pt-4 text-xs text-muted-foreground">
                            Created on{' '}
                            {new Date(notice.created_at).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog}
                onOpenChange={setDeleteDialog}
                title={t('confirm.are_you_sure')}
                description={t('confirm.cannot_undo')}
                confirmText={t('confirm.delete')}
                cancelText={t('actions.cancel')}
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

NoticesShow.layout = {
    breadcrumbs: [
        { title: 'Notice Board', href: notices.index() },
        { title: 'View', href: '#' },
    ],
};
