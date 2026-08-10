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
    notice: Notice;
};

export default function NoticesShow() {
    const { notice } = usePage<PageProps>().props;
    const { auth } = usePage().props;
    const isAdmin = isOwner(auth.user);
    const [deleteDialog, setDeleteDialog] = useState(false);

    const handleDelete = () => {
        setDeleteDialog(true);
    };

    const confirmDelete = () => {
        router.delete(`/notices/${notice.id}`, {
            onSuccess: () => {
                toast.success('Notice deleted successfully');
                router.visit('/notices');
            },
        });
        setDeleteDialog(false);
    };

    return (
        <>
            <Head title={notice.title} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href="/notices">
                        <Button variant="ghost" size="icon" className="size-9">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <Heading
                        title={notice.title}
                        description={`Posted by ${notice.creator.name}`}
                    />
                    {isAdmin && (
                        <div className="ml-auto flex gap-2">
                            <Link href={`/notices/${notice.id}/edit`}>
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
                            <Badge variant={notice.is_active ? 'success' : 'secondary'}>
                                {notice.is_active ? 'Active' : 'Draft'}
                            </Badge>
                            {notice.batch ? (
                                <Badge variant="secondary">{notice.batch.name}</Badge>
                            ) : (
                                <Badge variant="outline">Center-wide</Badge>
                            )}
                            {notice.published_at && (
                                <span className="text-sm text-muted-foreground">
                                    Published {new Date(notice.published_at).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="prose max-w-none whitespace-pre-wrap">
                            {notice.content}
                        </div>
                        <div className="mt-6 border-t pt-4 text-sm text-muted-foreground">
                            Created on {new Date(notice.created_at).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog}
                onOpenChange={setDeleteDialog}
                title="Delete Notice"
                description={`Are you sure you want to delete "${notice.title}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

NoticesShow.layout = {
    breadcrumbs: [
        { title: 'Notice Board', href: '/notices' },
        { title: 'View', href: '#' },
    ],
};
