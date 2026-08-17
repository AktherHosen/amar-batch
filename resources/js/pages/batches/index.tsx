import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { isOwner } from '@/lib/role';
import { Plus, Eye, EllipsisVertical, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable, type DataTableProps } from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import { RefreshButton } from '@/components/refresh-button';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import batches from '@/routes/batches';
import { useLocale } from '@/contexts/locale-context';

type BatchRow = {
    id: number;
    name: string;
    subject: string | null;
    capacity: number;
    status: string;
    enrollments_count: number;
    start_date: string | null;
    end_date: string | null;
};

type PageProps = {
    auth: { user: { role: string } };
    batches: {
        data: BatchRow[];
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

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(batches.index(), { search: value, status }, { preserveState: true });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get(batches.index(), { search, status: value }, { preserveState: true });
    };

    const clearAll = () => {
        setSearch('');
        setStatus('');
        router.get(batches.index(), {}, { preserveState: true });
    };

    const activeFilterCount = status ? 1 : 0;

    const handleDelete = (batch: { id: number; name: string }) => {
        setDeleteDialog({ open: true, batch });
    };

    const confirmDelete = () => {
        if (deleteDialog.batch) {
            router.delete(batches.destroy(deleteDialog.batch.id), {
                onSuccess: () => {
                    toast.success(t('toast.deleted_successfully'));
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
                    toast.success(t('toast.completed_successfully'));
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

    const columns = (() => {
        type Col = NonNullable<DataTableProps<BatchRow, unknown>['columns']>[number];
        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: t('batches.name'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">{row.original.name}</span>
                ),
            } as Col,
            {
                id: 'subject',
                accessorKey: 'subject',
                header: t('batches.subject'),
                enableSorting: false,
                cell: ({ row }: any) => row.original.subject || '-',
            } as Col,
            {
                id: 'capacity',
                accessorKey: 'capacity',
                header: t('batches.capacity'),
                enableSorting: false,
                cell: ({ row }: any) => row.original.capacity,
            } as Col,
            {
                id: 'enrollments_count',
                accessorKey: 'enrollments_count',
                header: t('batches.enrolled'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const batch: BatchRow = row.original;
                    return (
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
                    );
                },
            } as Col,
            {
                id: 'status',
                accessorKey: 'status',
                header: t('students.status'),
                enableSorting: false,
                cell: ({ row }: any) => (
                    <Badge variant={getStatusBadge(row.original.status)}>
                        {row.original.status}
                    </Badge>
                ),
            } as Col,
            {
                id: 'actions',
                header: '',
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }: any) => {
                    const batch: BatchRow = row.original;
                    return (
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
                                        {batch.status !== 'completed' && (
                                            <DropdownMenuItem onClick={() => handleComplete(batch)}>
                                                <CheckCircle className="mr-2 size-4" />
                                                {t('actions.complete')}
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={() => handleDelete(batch)} className="text-destructive">
                                            <Trash2 className="mr-2 size-4" />
                                            {t('actions.delete')}
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            } as Col,
        ];
    })();

    return (
        <>
            <Head title={t('batches.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title={t('batches.title')}
                        description={t('batches.desc')}
                    />
                    <div className="flex items-center gap-1">
                        <RefreshButton
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                router.reload({
                                    only: ['batches'],
                                    onFinish: () => setRefreshing(false),
                                });
                            }}
                        />
                        {isAdmin && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="size-8 p-0">
                                        <EllipsisVertical className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href={batches.create()}>
                                            <Plus className="mr-2 size-4" />
                                            {t('batches.create')}
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <DataTable
                            columns={columns}
                            data={pagination.data}
                            loading={refreshing}
                            currentPage={pagination.current_page}
                            lastPage={pagination.last_page}
                            total={pagination.total}
                            itemName={t('batches.title').toLowerCase() + 's'}
                            baseUrl={batches.index().url}
                            preserveParams={{ search, status }}
                            emptyMessage={t('batches.no_batches')}
                            getRowId={(row) => String(row.id)}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder={t('actions.search') + '...'}
                                    searchValue={search}
                                    onSearchChange={handleSearch}
                                    activeFilterCount={activeFilterCount}
                                    onClearAll={clearAll}
                                    filters={[
                                        {
                                            id: 'status',
                                            placeholder: t('batches.all_status'),
                                            value: status,
                                            options: [
                                                { label: t('students.active'), value: 'active' },
                                                { label: t('students.inactive'), value: 'inactive' },
                                                { label: t('actions.complete'), value: 'completed' },
                                                { label: t('batches.archived'), value: 'archived' },
                                            ],
                                            onValueChange: handleStatusChange,
                                        },
                                    ]}
                                />
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, batch: null })}
                title={t('batches.delete_title')}
                description={t('batches.delete_confirm').replace('{name}', deleteDialog.batch?.name ?? '')}
                confirmText={t('actions.delete')}
                cancelText={t('actions.cancel')}
                variant="destructive"
                onConfirm={confirmDelete}
            />

            <ConfirmDialog
                open={completeDialog.open}
                onOpenChange={(open) => setCompleteDialog({ open, batch: null })}
                title={t('batches.complete_title')}
                description={t('batches.complete_confirm').replace('{name}', completeDialog.batch?.name ?? '')}
                confirmText={t('actions.complete')}
                cancelText={t('actions.cancel')}
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