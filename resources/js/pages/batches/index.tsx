import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { isOwner } from '@/lib/role';
import { Plus, RefreshCw, Search, Eye, EllipsisVertical, Pencil, Trash2, X, CheckCircle } from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import batches from '@/routes/batches';
import { useLocale } from '@/contexts/locale-context';

type PageProps = {
    auth: { user: { role: string } };
    batches: {
        data: Array<{
            id: number;
            name: string;
            subject: string | null;
            capacity: number;
            status: string;
            enrollments_count: number;
            start_date: string | null;
            end_date: string | null;
        }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
};

export default function BatchesIndex({
    batches: pagination,
    filters,
}: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const isAdmin = isOwner(auth.user);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; batch: { id: number; name: string } | null }>({ open: false, batch: null });
    const [completeDialog, setCompleteDialog] = useState<{ open: boolean; batch: { id: number; name: string } | null }>({ open: false, batch: null });

    const handleSearch = () => {
        router.get(
            batches.index(),
            { search, status },
            { preserveState: true },
        );
    };

    const handleStatusChange = (value: string) => {
        setStatus(value === 'all' ? '' : value);
        router.get(
            batches.index(),
            { search, status: value === 'all' ? '' : value },
            { preserveState: true },
        );
    };

    const handleDelete = (batch: { id: number; name: string }) => {
        setDeleteDialog({ open: true, batch });
    };

    const confirmDelete = () => {
        if (deleteDialog.batch) {
            router.delete(batches.destroy(deleteDialog.batch.id), {
                onSuccess: () => {
                    toast.success('Batch deleted successfully');
                    setDeleteDialog({ open: false, batch: null });
                },
            });
        }
    };

    const handleComplete = (batch: { id: number; name: string }) => {
        setCompleteDialog({ open: true, batch });
    };

    const confirmComplete = () => {
        if (completeDialog.batch) {
            router.put(`/batches/${completeDialog.batch.id}/complete`, {}, {
                only: ['batches'],
                onSuccess: () => {
                    toast.success('Batch completed successfully');
                    setCompleteDialog({ open: false, batch: null });
                },
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            'default' | 'secondary' | 'destructive' | 'success' | 'danger'
        > = {
            active: 'default',
            inactive: 'danger',
            completed: 'success',
            archived: 'destructive',
        };

        return variants[status] || 'secondary';
    };

    return (
        <>
            <Head title={t('batches.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('batches.title')}
                        description={t('batches.title')}
                    />
                    {isAdmin && (
                        <Link href={batches.create()}>
                            <Button>
                                <Plus className="mr-2 size-4" />
                                {t('batches.create')}
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
                                    placeholder={t('actions.search') + '...'}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleSearch()
                                    }
                                    className="pr-9 pl-9"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            router.get(
                                                batches.index(),
                                                { status },
                                                { preserveState: true },
                                            );
                                        }}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-3 sm:gap-4">
                                <Select
                                    value={status || 'all'}
                                    onValueChange={handleStatusChange}
                                >
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('actions.search')} Status
                                        </SelectItem>
                                        <SelectItem value="active">
                                            {t('students.active')}
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            {t('students.inactive')}
                                        </SelectItem>
                                        <SelectItem value="archived">
                                            Archived
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="secondary"
                                    onClick={handleSearch}
                                >
                                    <Search className="size-4 sm:mr-2" />
                                    <span className="hidden sm:inline">
                                        {t('actions.search')}
                                    </span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={refreshing}
                                    onClick={() => {
                                        setRefreshing(true);
                                        router.reload({
                                            only: ['batches'],
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
                                    <TableHead className="sticky left-0 z-10 min-w-[150px] bg-background">
                                        {t('batches.name')}
                                    </TableHead>
                                    <TableHead>
                                        {t('batches.subject')}
                                    </TableHead>
                                    <TableHead>
                                        {t('batches.capacity')}
                                    </TableHead>
                                    <TableHead>
                                        {t('batches.enrolled')}
                                    </TableHead>
                                    <TableHead>
                                        {t('students.status')}
                                    </TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pagination.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center"
                                        >
                                            No batches found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pagination.data.map((batch) => (
                                        <TableRow key={batch.id}>
                                            <TableCell className="sticky left-0 z-10 bg-background font-medium">
                                                {batch.name}
                                            </TableCell>
                                            <TableCell>
                                                {batch.subject || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {batch.capacity}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span>{batch.enrollments_count}</span>
                                                    <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className={`h-full rounded-full ${
                                                                batch.enrollments_count >= batch.capacity
                                                                    ? 'bg-red-500'
                                                                    : batch.enrollments_count >= batch.capacity * 0.8
                                                                      ? 'bg-yellow-500'
                                                                      : 'bg-green-500'
                                                            }`}
                                                            style={{
                                                                width: `${Math.min((batch.enrollments_count / batch.capacity) * 100, 100)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {Math.round((batch.enrollments_count / batch.capacity) * 100)}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={getStatusBadge(
                                                        batch.status,
                                                    )}
                                                >
                                                    {batch.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="p-1 text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="size-8 p-0">
                                                            <EllipsisVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={batches.show(batch.id)}>
                                                                <Eye className="mr-2 size-4" />
                                                                {t('actions.view')}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {isAdmin && (
                                                            <>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={batches.edit(batch.id)}>
                                                                        <Pencil className="mr-2 size-4" />
                                                                        {t('actions.edit')}
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleDelete(batch)} className="text-destructive">
                                                                    <Trash2 className="mr-2 size-4" />
                                                                    {t('actions.delete')}
                                                                </DropdownMenuItem>
                                                                {batch.status !== 'completed' && (
                                                                    <DropdownMenuItem onClick={() => handleComplete(batch)}>
                                                                        <CheckCircle className="mr-2 size-4" />
                                                                        Complete
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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
                            itemName={t('batches.title').toLowerCase() + 's'}
                            baseUrl={batches.index()}
                            preserveParams={{ search, status }}
                        />
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, batch: null })}
                title="Delete Batch"
                description={`Are you sure you want to delete "${deleteDialog.batch?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
                onConfirm={confirmDelete}
            />

            <ConfirmDialog
                open={completeDialog.open}
                onOpenChange={(open) => setCompleteDialog({ open, batch: null })}
                title="Complete Batch"
                description={`Are you sure you want to complete "${completeDialog.batch?.name}"? This action cannot be undone. Once completed, no new students can be enrolled and no teachers can be assigned.`}
                confirmText="Complete"
                onConfirm={confirmComplete}
            />
        </>
    );
}

BatchesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Batches',
            href: batches.index(),
        },
    ],
};
