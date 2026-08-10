import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { isOwner } from '@/lib/role';

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
    holiday: Holiday;
};

export default function HolidaysShow() {
    const { holiday } = usePage<PageProps>().props;
    const { auth } = usePage().props;
    const isAdmin = isOwner(auth.user);
    const [deleteDialog, setDeleteDialog] = useState(false);

    const handleDelete = () => {
        setDeleteDialog(true);
    };

    const confirmDelete = () => {
        router.delete(`/holidays/${holiday.id}`, {
            onSuccess: () => {
                toast.success('Holiday deleted successfully');
                router.visit('/holidays');
            },
        });
        setDeleteDialog(false);
    };

    const duration = Math.ceil(
        (new Date(holiday.end_date).getTime() - new Date(holiday.start_date).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    const getTypeBadge = (type: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            holiday: 'default',
            exam: 'secondary',
            other: 'destructive',
        };
        return variants[type] || 'secondary';
    };

    return (
        <>
            <Head title={holiday.title} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href="/holidays">
                        <Button variant="ghost" size="icon" className="size-9">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <Heading
                        title={holiday.title}
                        description={`${duration} day(s) from ${new Date(holiday.start_date).toLocaleDateString()} to ${new Date(holiday.end_date).toLocaleDateString()}`}
                    />
                    {isAdmin && (
                        <div className="ml-auto flex gap-2">
                            <Link href={`/holidays/${holiday.id}/edit`}>
                                <Button variant="outline">
                                    <Pencil className="mr-2 size-4" />
                                    Edit
                                </Button>
                            </Link>
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="mr-2 size-4" />
                                Delete
                            </Button>
                        </div>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Badge variant={getTypeBadge(holiday.type)}>
                                {holiday.type}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {holiday.description && (
                            <div className="mb-6">
                                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Description</h3>
                                <p className="whitespace-pre-wrap">{holiday.description}</p>
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Start Date</h3>
                                <p>{new Date(holiday.start_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div>
                                <h3 className="mb-2 text-sm font-medium text-muted-foreground">End Date</h3>
                                <p>{new Date(holiday.end_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>

                        <div className="mt-6 border-t pt-4 text-sm text-muted-foreground">
                            Created on {new Date(holiday.created_at).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog}
                onOpenChange={setDeleteDialog}
                title="Delete Holiday"
                description={`Are you sure you want to delete "${holiday.title}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

HolidaysShow.layout = {
    breadcrumbs: [
        { title: 'Holiday Calendar', href: '/holidays' },
        { title: 'View', href: '#' },
    ],
};
