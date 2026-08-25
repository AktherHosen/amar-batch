import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Eye,
    EllipsisVertical,
    PenLine,
    Plus,
    Trash2,
    CheckCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import BatchForm from '@/components/batch-form';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable  } from '@/components/data-table';
import type {DataTableProps} from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import Heading from '@/components/heading';
import PageActions from '@/components/page-actions';
import { RefreshButton } from '@/components/refresh-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useLocale } from '@/contexts/locale-context';
import { isOwner } from '@/lib/role';
import batches from '@/routes/batches';

type BatchRow = {
    id: number;
    name: string;
    subject: string | null;
    days: string | null;
    time: string | null;
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
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        batch: { id: number; name: string } | null;
    }>({ open: false, batch: null });
    const [completeDialog, setCompleteDialog] = useState<{
        open: boolean;
        batch: { id: number; name: string } | null;
    }>({ open: false, batch: null });
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editingBatch, setEditingBatch] = useState<BatchRow | null>(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleCreate = () => {
        setEditingBatch(null);
        setErrors({});
        setSheetOpen(true);
    };

    const handleEdit = (batch: BatchRow) => {
        setEditingBatch(batch);
        setErrors({});
        setSheetOpen(true);
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            batches.index(),
            { search: value, status },
            { preserveState: true },
        );
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get(
            batches.index(),
            { search, status: value },
            { preserveState: true },
        );
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
            router.put(
                `/batches/${completeDialog.batch.id}/complete`,
                {},
                {
                    only: ['batches'],
                    onSuccess: () => {
                        toast.success(t('toast.completed_successfully'));
                        setCompleteDialog({ open: false, batch: null });
                    },
                },
            );
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
        type Col = NonNullable<
            DataTableProps<BatchRow, unknown>['columns']
        >[number];

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
                                        batch.enrollments_count >=
                                        batch.capacity
                                            ? 'bg-red-500'
                                            : batch.enrollments_count >=
                                                batch.capacity * 0.8
                                              ? 'bg-yellow-500'
                                              : 'bg-green-500'
                                    }`}
                                    style={{
                                        width: `${Math.min((batch.enrollments_count / batch.capacity) * 100, 100)}%`,
                                    }}
                                />
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {Math.round(
                                    (batch.enrollments_count / batch.capacity) *
                                        100,
                                )}
                                %
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
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="size-8 p-0"
                                >
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
                                        <DropdownMenuItem
                                            onClick={() => handleEdit(batch)}
                                        >
                                            <PenLine className="mr-2 size-4" />
                                            {t('actions.edit')}
                                        </DropdownMenuItem>
                                        {batch.status !== 'completed' && (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleComplete(batch)
                                                }
                                            >
                                                <CheckCircle className="mr-2 size-4" />
                                                {t('actions.complete')}
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                            onClick={() => handleDelete(batch)}
                                            className="text-destructive"
                                        >
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
                        <PageActions
                            isAdmin={isAdmin}
                            createLabel={t('batches.create')}
                            onCreate={handleCreate}
                            exportTitle={t('batches.title')}
                            exportFilename="batches"
                            exportHeaders={[
                                t('batches.name'),
                                t('batches.subject'),
                                t('batches.capacity'),
                                t('batches.enrolled'),
                                t('students.status'),
                            ]}
                            exportRows={pagination.data.map((b) => [
                                b.name,
                                b.subject || '-',
                                b.capacity,
                                b.enrollments_count,
                                b.status,
                            ])}
                            importUrl="/batches/import"
                            importFields={[
                                'name',
                                'subject',
                                'capacity',
                                'days',
                                'time',
                                'start_date',
                                'end_date',
                            ]}
                            onImportSuccess={() =>
                                router.reload({ only: ['batches'] })
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
                            itemName={t('batches.title').toLowerCase()}
                            baseUrl={batches.index().url}
                            preserveParams={{ search, status }}
                            emptyMessage={t('batches.no_batches')}
                            getRowId={(row) => String(row.id)}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder={
                                        t('actions.search') + '...'
                                    }
                                    searchValue={search}
                                    onSearchChange={handleSearch}
                                    activeFilterCount={activeFilterCount}
                                    onClearAll={clearAll}
                                    filters={[
                                        {
                                            id: 'status',
                                            placeholder:
                                                t('batches.all_status'),
                                            value: status,
                                            options: [
                                                {
                                                    label: t('students.active'),
                                                    value: 'active',
                                                },
                                                {
                                                    label: t(
                                                        'students.inactive',
                                                    ),
                                                    value: 'inactive',
                                                },
                                                {
                                                    label: t(
                                                        'actions.complete',
                                                    ),
                                                    value: 'completed',
                                                },
                                                {
                                                    label: t(
                                                        'batches.archived',
                                                    ),
                                                    value: 'archived',
                                                },
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
                description={t('batches.delete_confirm').replace(
                    '{name}',
                    deleteDialog.batch?.name ?? '',
                )}
                confirmText={t('actions.delete')}
                cancelText={t('actions.cancel')}
                variant="destructive"
                onConfirm={confirmDelete}
            />

            <ConfirmDialog
                open={completeDialog.open}
                onOpenChange={(open) =>
                    setCompleteDialog({ open, batch: null })
                }
                title={t('batches.complete_title')}
                description={t('batches.complete_confirm').replace(
                    '{name}',
                    completeDialog.batch?.name ?? '',
                )}
                confirmText={t('actions.complete')}
                cancelText={t('actions.cancel')}
                onConfirm={confirmComplete}
            />

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {editingBatch ? t('actions.edit') + ' ' + t('batches.title') : t('actions.create') + ' ' + t('batches.title')}
                        </SheetTitle>
                        <SheetDescription>
                            {editingBatch
                                ? t('actions.update') + ' batch details'
                                : 'Add a new batch'}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="px-4 pb-4">
                        <BatchForm
                            batch={editingBatch || undefined}
                            onSubmit={(data) => {
                                setProcessing(true);
                                if (editingBatch) {
                                    router.put(
                                        `/batches/${editingBatch.id}`,
                                        data,
                                        {
                                            onSuccess: () => {
                                                toast.success(
                                                    t('toast.updated_successfully'),
                                                );
                                                setSheetOpen(false);
                                                setEditingBatch(null);
                                            },
                                            onFinish: () =>
                                                setProcessing(false),
                                            onError: (err) => {
                                                setErrors(err);
                                                setProcessing(false);
                                            },
                                        },
                                    );
                                } else {
                                    router.post('/batches', data, {
                                        onSuccess: () => {
                                            toast.success(
                                                t('toast.created_successfully'),
                                            );
                                            setSheetOpen(false);
                                        },
                                        onFinish: () =>
                                            setProcessing(false),
                                        onError: (err) => {
                                            setErrors(err);
                                            setProcessing(false);
                                        },
                                    });
                                }
                            }}
                            processing={processing}
                            errors={errors}
                            hideActions
                        />
                    </div>
                    <SheetFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSheetOpen(false)}
                        >
                            {t('actions.cancel')}
                        </Button>
                        <Button type="submit" form="batch-form" disabled={processing}>
                            {processing
                                ? editingBatch
                                    ? t('actions.updating')
                                    : t('actions.creating')
                                : editingBatch
                                  ? t('actions.update')
                                  : t('actions.create')}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
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
