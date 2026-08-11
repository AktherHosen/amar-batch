import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, Search, X, EllipsisVertical, Eye, Pencil, Trash2, Megaphone } from 'lucide-react';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
                                <Select
                                    value={batchId || 'all'}
                                    onValueChange={(value) => {
                                        const v = value === 'all' ? '' : value;
                                        setBatchId(v);
                                        router.get('/notices', { search, batch_id: v }, { preserveState: true });
                                    }}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="All Batches" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Batches</SelectItem>
                                        <SelectItem value="center">Center-wide</SelectItem>
                                        {batches.map((batch) => (
                                            <SelectItem key={batch.id} value={String(batch.id)}>
                                                {batch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button variant="ghost" size="icon" disabled={refreshing} onClick={() => {
                                    setRefreshing(true);
                                    router.reload({ only: ['notices'], onFinish: () => setRefreshing(false) });
                                }}>
                                    <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="sticky left-0 z-10 min-w-[150px] bg-background">Title</TableHead>
                                    <TableHead>Batch</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Posted by</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <motion.tbody
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: {},
                                    visible: { transition: { staggerChildren: 0.03 } },
                                }}
                            >
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
                                        <motion.tr
                                            key={notice.id}
                                            variants={{
                                                hidden: { opacity: 0, x: -8 },
                                                visible: { opacity: 1, x: 0 },
                                            }}
                                        >
                                            <TableCell className="sticky left-0 z-10 min-w-[150px] bg-background font-medium">
                                                {notice.title}
                                            </TableCell>
                                            <TableCell>
                                                {notice.batch ? (
                                                    <Badge variant="secondary">{notice.batch.name}</Badge>
                                                ) : (
                                                    <Badge variant="outline">Center-wide</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={notice.is_active ? 'success' : 'secondary'}>
                                                    {notice.is_active ? 'Active' : 'Draft'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {notice.creator.name}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(notice.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="size-8 p-0">
                                                            <EllipsisVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => router.get(`/notices/${notice.id}`)}>
                                                            <Eye className="mr-2 size-4" />
                                                            View
                                                        </DropdownMenuItem>
                                                        {isAdmin && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => router.get(`/notices/${notice.id}/edit`)}>
                                                                    <Pencil className="mr-2 size-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(notice)}>
                                                                    <Trash2 className="mr-2 size-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </motion.tr>
                                    ))
                                )}
                            </motion.tbody>
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
