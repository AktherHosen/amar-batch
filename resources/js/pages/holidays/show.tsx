import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { isOwner } from '@/lib/role';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import holidays from '@/routes/holidays';
import { useLocale } from '@/contexts/locale-context';

type Holiday = {
    id: number;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string;
    type: string;
    created_at: string;
};

type PageProps = {
    auth: { user: { role: string } };
    holiday: Holiday;
};

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function HolidaysShow() {
    const { holiday } = usePage<PageProps>().props;
    const { auth } = usePage<PageProps>().props;
    const { t } = useLocale();
    const isAdmin = isOwner(auth.user);
    const [deleteDialog, setDeleteDialog] = useState(false);

    const duration =
        Math.ceil(
            (new Date(holiday.end_date).getTime() -
                new Date(holiday.start_date).getTime()) /
                (1000 * 60 * 60 * 24),
        ) + 1;

    const handleDelete = () => {
        setDeleteDialog(true);
    };

    const confirmDelete = () => {
        router.delete(holidays.destroy(holiday.id), {
            onSuccess: () => {
                toast.success(t('toast.deleted_successfully'));
                router.visit(holidays.index().url);
            },
        });
        setDeleteDialog(false);
    };

    const getTypeBadge = (type: string) => {
        const variants: Record<
            string,
            'default' | 'secondary' | 'destructive'
        > = {
            holiday: 'default',
            exam: 'secondary',
            event: 'destructive',
        };
        return variants[type] || 'secondary';
    };

    return (
        <>
            <Head title={holiday.title} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex min-w-0 items-center justify-between">
                    <div className="flex min-w-0 items-center gap-2">
                        <Link href={holidays.index()} className="shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-9"
                            >
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <h1 className="truncate text-lg font-bold tracking-tight sm:text-2xl">
                            {holiday.title}
                        </h1>
                    </div>
                    {isAdmin && (
                        <div className="flex shrink-0 gap-2">
                            <Link href={holidays.edit(holiday.id)}>
                                <Button variant="outline">
                                    <Pencil className="mr-2 size-4" />
                                    {t('actions.edit')}
                                </Button>
                            </Link>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                            >
                                <Trash2 className="mr-2 size-4" />
                                {t('actions.delete')}
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Holiday Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Type
                                    </p>
                                    <Badge variant={getTypeBadge(holiday.type)}>
                                        {holiday.type}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Duration
                                    </p>
                                    <p className="text-sm font-medium">
                                        {duration} day(s)
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Start Date
                                    </p>
                                    <p className="text-sm font-medium">
                                        {formatDate(holiday.start_date)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        End Date
                                    </p>
                                    <p className="text-sm font-medium">
                                        {formatDate(holiday.end_date)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap">
                                {holiday.description || '-'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="text-xs text-muted-foreground">
                    Created on {new Date(holiday.created_at).toLocaleString()}
                </div>
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

HolidaysShow.layout = {
    breadcrumbs: [
        { title: 'Holiday Calendar', href: holidays.index() },
        { title: 'View', href: '#' },
    ],
};
