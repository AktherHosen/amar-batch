import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { EllipsisVertical, Eye, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { isOwner } from '@/lib/role';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import PageActions from '@/components/page-actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale } from '@/contexts/locale-context';
import { DataTable, type DataTableProps } from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import { RefreshButton } from '@/components/refresh-button';
import CellTitle from '@/components/cell-title';
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

export default function NoticesIndex({
    notices: pagination,
    batches,
    filters,
}: PageProps) {
    const { t, formatDate } = useLocale();
    const { auth } = usePage().props;
    const isAdmin = isOwner(auth.user);
    const [search, setSearch] = useState(filters.search || '');
    const [batchId, setBatchId] = useState(filters.batch_id || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: Notice | null;
    }>({ open: false, item: null });

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            '/notices',
            { search: value, batch_id: batchId },
            { preserveState: true },
        );
    };

    const handleDelete = (notice: Notice) => {
        setDeleteDialog({ open: true, item: notice });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(`/notices/${deleteDialog.item.id}`, {
                onSuccess: () => toast.success(t('toast.deleted_successfully')),
            });
            setDeleteDialog({ open: false, item: null });
        }
    };

    const activeFilterCount = batchId ? 1 : 0;

    const columns = (() => {
        type Col = NonNullable<
            DataTableProps<Notice, unknown>['columns']
        >[number];
        return [
            {
                id: 'title',
                accessorKey: 'title',
                header: 'Title',
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <CellTitle
                        title={row.original.title}
                        href={`/notices/${row.original.id}`}
                    />
                ),
            } as Col,
            {
                id: 'batch',
                accessorKey: 'batch.name',
                header: 'Batch',
                enableSorting: false,
                cell: ({ row }: any) => {
                    const notice: Notice = row.original;
                    return notice.batch ? (
                        <Badge variant="secondary">{notice.batch.name}</Badge>
                    ) : (
                        <Badge variant="outline">Center-wide</Badge>
                    );
                },
            } as Col,
            {
                id: 'status',
                accessorKey: 'is_active',
                header: 'Status',
                enableSorting: false,
                cell: ({ row }: any) => {
                    const notice: Notice = row.original;
                    return (
                        <Badge
                            variant={notice.is_active ? 'success' : 'secondary'}
                        >
                            {notice.is_active ? 'Active' : 'Draft'}
                        </Badge>
                    );
                },
            } as Col,
            {
                id: 'creator',
                accessorKey: 'creator.name',
                header: 'Posted by',
                enableSorting: false,
                cell: ({ row }: any) => row.original.creator.name,
            } as Col,
            {
                id: 'date',
                accessorKey: 'created_at',
                header: 'Date',
                enableSorting: false,
                cell: ({ row }: any) =>
                    new Date(row.original.created_at).toLocaleDateString(),
            } as Col,
            {
                id: 'actions',
                header: '',
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }: any) => {
                    const notice: Notice = row.original;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="size-8 p-0"
                                >
                                    <EllipsisVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() =>
                                        router.get(`/notices/${notice.id}`)
                                    }
                                >
                                    <Eye className="mr-2 size-4" />
                                    View
                                </DropdownMenuItem>
                                {isAdmin && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                router.get(
                                                    `/notices/${notice.id}/edit`,
                                                )
                                            }
                                        >
                                            <Pencil className="mr-2 size-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => handleDelete(notice)}
                                        >
                                            <Trash2 className="mr-2 size-4" />
                                            Delete
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
            <Head title="Notice Board" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Notice Board"
                        description="Post and manage announcements"
                    />
                    <div className="flex items-center gap-1">
                        <RefreshButton
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                router.reload({
                                    only: ['notices'],
                                    onFinish: () => setRefreshing(false),
                                });
                            }}
                        />
                        <PageActions
                            isAdmin={isAdmin}
                            createLabel="New Notice"
                            onCreate={() => router.get('/notices/create')}
                            exportTitle="Notices"
                            exportFilename="notices"
                            exportHeaders={[
                                'Title',
                                'Content',
                                'Batch',
                                'Status',
                                'Published',
                            ]}
                            exportRows={pagination.data.map((n) => [
                                n.title,
                                n.content,
                                n.batch?.name || 'Center-wide',
                                n.is_active ? 'Active' : 'Draft',
                                n.published_at
                                    ? formatDate(n.published_at)
                                    : '',
                            ])}
                            importUrl="/notices/import"
                            importFields={[
                                'title',
                                'content',
                                'batch_id',
                                'target_audience',
                                'priority',
                            ]}
                            onImportSuccess={() =>
                                router.reload({ only: ['notices'] })
                            }
                        />
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
                            itemName="notices"
                            baseUrl={notices.index().url}
                            preserveParams={{ search, batch_id: batchId }}
                            emptyMessage="No notices found"
                            getRowId={(row) => String(row.id)}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder="Search notices..."
                                    searchValue={search}
                                    onSearchChange={handleSearch}
                                    activeFilterCount={activeFilterCount}
                                    filters={[
                                        {
                                            id: 'batch_id',
                                            placeholder: 'All Batches',
                                            value: batchId,
                                            options: [
                                                {
                                                    label: 'Center-wide',
                                                    value: 'center',
                                                },
                                                ...batches.map((batch) => ({
                                                    label: batch.name,
                                                    value: String(batch.id),
                                                })),
                                            ],
                                            onValueChange: (value) => {
                                                setBatchId(value);
                                                router.get(
                                                    '/notices',
                                                    { search, batch_id: value },
                                                    { preserveState: true },
                                                );
                                            },
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
                onOpenChange={(open) =>
                    setDeleteDialog({ open, item: deleteDialog.item })
                }
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
    breadcrumbs: [{ title: 'Notice Board', href: '/notices' }],
};
