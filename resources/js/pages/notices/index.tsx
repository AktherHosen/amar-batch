import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, RefreshCw, Search, X, Eye, Pencil, Trash2, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { isOwner } from '@/lib/role';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useLocale } from '@/contexts/locale-context';

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

type Batch = {
    id: number;
    name: string;
};

type PageProps = {
    notices: {
        data: Notice[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    batches: Batch[];
    filters: {
        search?: string;
        batch_id?: string;
    };
};

export default function NoticesIndex({ notices: pagination, batches, filters }: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage().props;
    const isAdmin = isOwner(auth.user);
    const [search, setSearch] = useState(filters.search || '');
    const [batchId, setBatchId] = useState(filters.batch_id || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Notice | null }>({ open: false, item: null });

    const handleSearch = () => {
        router.get('/notices', { search, batch_id: batchId }, { preserveState: true });
    };

    const handleDelete = (notice: Notice) => {
        setDeleteDialog({ open: true, item: notice });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(`/notices/${deleteDialog.item.id}`, {
                onSuccess: () => toast.success('Notice deleted successfully'),
            });
            setDeleteDialog({ open: false, item: null });
        }
    };

    return (
        <>
            <Head title="Notice Board" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Notice Board"
                        description="Post and manage announcements"
                    />
                    {isAdmin && (
                        <Link href="/notices/create">
                            <Button>
                                <Plus className="mr-2 size-4" />
                                New Notice
                            </Button>
                        </Link>
                    )}
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search notices..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pr-9 pl-9"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            router.get('/notices', { batch_id: batchId }, { preserveState: true });
                                        }}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={batchId}
                                    onChange={(e) => {
                                        setBatchId(e.target.value);
                                        router.get('/notices', { search, batch_id: e.target.value }, { preserveState: true });
                                    }}
                                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">All Batches</option>
                                    <option value="center">Center-wide</option>
                                    {batches.map((batch) => (
                                        <option key={batch.id} value={batch.id}>
                                            {batch.name}
                                        </option>
                                    ))}
                                </select>
                                <Button variant="secondary" onClick={handleSearch}>
                                    <Search className="size-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Search</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={refreshing}
                                    onClick={() => {
                                        setRefreshing(true);
                                        router.reload({
                                            only: ['notices'],
                                            onFinish: () => setRefreshing(false),
                                        });
                                    }}
                                >
                                    <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="whitespace-nowrap">Title</TableHead>
                                    <TableHead className="whitespace-nowrap">Batch</TableHead>
                                    <TableHead className="whitespace-nowrap">Status</TableHead>
                                    <TableHead className="whitespace-nowrap">Posted by</TableHead>
                                    <TableHead className="whitespace-nowrap">Date</TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pagination.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">
                                            <div className="flex flex-col items-center gap-2 py-4">
                                                <Megaphone className="size-8 text-muted-foreground" />
                                                <p>No notices found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pagination.data.map((notice) => (
                                        <TableRow key={notice.id}>
                                            <TableCell className="whitespace-nowrap font-medium">
                                                {notice.title}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {notice.batch ? (
                                                    <Badge variant="secondary">{notice.batch.name}</Badge>
                                                ) : (
                                                    <Badge variant="outline">Center-wide</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <Badge variant={notice.is_active ? 'success' : 'secondary'}>
                                                    {notice.is_active ? 'Active' : 'Draft'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {notice.creator.name}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {new Date(notice.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex gap-1">
                                                    <Link href={`/notices/${notice.id}`}>
                                                        <Button variant="ghost" size="sm" className="size-8 p-0">
                                                            <Eye className="size-4" />
                                                        </Button>
                                                    </Link>
                                                    {isAdmin && (
                                                        <>
                                                            <Link href={`/notices/${notice.id}/edit`}>
                                                                <Button variant="ghost" size="sm" className="size-8 p-0">
                                                                    <Pencil className="size-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="size-8 p-0 text-destructive hover:text-destructive"
                                                                onClick={() => handleDelete(notice)}
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        <Pagination
                            currentPage={pagination.current_page}
                            lastPage={pagination.last_page}
                            total={pagination.total}
                            perPage={pagination.per_page}
                            itemName="notices"
                            baseUrl="/notices"
                            preserveParams={{ search, batch_id: batchId }}
                        />
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, item: deleteDialog.item })}
                title="Delete Notice"
                description={`Are you sure you want to delete "${deleteDialog.item?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

NoticesIndex.layout = {
    breadcrumbs: [
        { title: 'Notice Board', href: '/notices' },
    ],
};
