import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { EllipsisVertical, Pencil, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { isOwner, isStaff } from '@/lib/role';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { DataTable, type DataTableProps } from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import { RefreshButton } from '@/components/refresh-button';
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
import attendance from '@/routes/attendance';
import { useLocale } from '@/contexts/locale-context';

type AttendanceRecord = {
    id: number;
    student: { id: number; name: string };
    batch: { id: number; name: string };
    date: string;
    status: 'present' | 'absent' | 'late';
    notes: string | null;
};

type Batch = {
    id: number;
    name: string;
};

type PageProps = {
    auth: { user: { role: string } };
    attendances: {
        data: AttendanceRecord[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    batches: Batch[];
    filters: {
        batch_id?: string;
        date?: string;
    };
};

export default function AttendanceIndex({
    attendances: pagination,
    batches,
    filters,
}: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const isAdmin = isOwner(auth.user);
    const isTeacher = isStaff(auth.user);
    const [search, setSearch] = useState('');
    const [batchId, setBatchId] = useState(filters.batch_id || '');
    const [date, setDate] = useState(filters.date || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: AttendanceRecord | null;
    }>({ open: false, item: null });

    const handleFilter = () => {
        router.get(
            attendance.index(),
            { search, batch_id: batchId, date },
            { preserveState: true },
        );
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            attendance.index(),
            { search: value, batch_id: batchId, date },
            { preserveState: true },
        );
    };

    const handleBatchChange = (value: string) => {
        setBatchId(value);
        router.get(
            attendance.index(),
            { search, batch_id: value, date },
            { preserveState: true },
        );
    };

    const clearAll = () => {
        setSearch('');
        setBatchId('');
        setDate('');
        router.get(attendance.index(), {}, { preserveState: true });
    };

    const activeFilterCount = (batchId ? 1 : 0) + (date ? 1 : 0);

    const handleDelete = (record: AttendanceRecord) => {
        setDeleteDialog({ open: true, item: record });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(attendance.destroy(deleteDialog.item.id));
            toast.success(t('toast.deleted_successfully'));
            setDeleteDialog({ open: false, item: null });
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            'default' | 'secondary' | 'destructive'
        > = {
            present: 'default',
            late: 'secondary',
            absent: 'destructive',
        };

        return variants[status] || 'secondary';
    };

    const columns = (() => {
        type Col = NonNullable<DataTableProps<AttendanceRecord, unknown>['columns']>[number];
        return [
            {
                id: 'student',
                accessorKey: 'student.name',
                header: t('attendance.student'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">{row.original.student.name}</span>
                ),
            } as Col,
            {
                id: 'batch',
                accessorKey: 'batch.name',
                header: t('attendance.batch'),
                enableSorting: false,
                cell: ({ row }: any) => row.original.batch.name,
            } as Col,
            {
                id: 'date',
                accessorKey: 'date',
                header: t('attendance.date'),
                enableSorting: true,
                cell: ({ row }: any) =>
                    new Date(row.original.date).toLocaleDateString(),
            } as Col,
            {
                id: 'status',
                accessorKey: 'status',
                header: t('attendance.status'),
                enableSorting: false,
                cell: ({ row }: any) => (
                    <Badge variant={getStatusBadge(row.original.status)}>
                        {row.original.status}
                    </Badge>
                ),
            } as Col,
            {
                id: 'notes',
                accessorKey: 'notes',
                header: t('attendance.notes'),
                enableSorting: false,
                cell: ({ row }: any) => row.original.notes || '-',
            } as Col,
            ...(isAdmin || isTeacher
                ? [
                    {
                        id: 'actions',
                        header: '',
                        enableSorting: false,
                        enableHiding: false,
                        cell: ({ row }: any) => {
                            const record: AttendanceRecord = row.original;
                            return (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="size-8 p-0">
                                            <EllipsisVertical className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => router.get(attendance.edit(record.id))}>
                                            <Pencil className="mr-2 size-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(record)}>
                                            <Trash2 className="mr-2 size-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            );
                        },
                    } as Col,
                ]
                : []),
        ];
    })();

    return (
        <>
            <Head title={t('attendance.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('attendance.title')}
                        description={t('attendance.desc')}
                    />
                    <div className="flex items-center gap-1">
                        <RefreshButton
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                router.reload({
                                    only: ['attendances'],
                                    onFinish: () => setRefreshing(false),
                                });
                            }}
                        />
                        {(isAdmin || isTeacher) && (
                            <Link href={attendance.create()}>
                                <Button>
                                    <Plus className="mr-2 size-4" />
                                    {t('attendance.mark')}
                                </Button>
                            </Link>
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
                            itemName={t('attendance.title').toLowerCase() + 's'}
                            baseUrl={attendance.index().url}
                            preserveParams={{ search, batch_id: batchId, date }}
                            emptyMessage="No attendance records found"
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
                                            id: 'batch_id',
                                            placeholder: t('attendance.batch'),
                                            value: batchId,
                                            options: batches.map((batch) => ({
                                                label: batch.name,
                                                value: batch.id.toString(),
                                            })),
                                            onValueChange: handleBatchChange,
                                        },
                                    ]}
                                >
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={date}
                                            onChange={(e) =>
                                                setDate(e.target.value)
                                            }
                                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                            className="w-full pr-9"
                                        />
                                        {date && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setDate('');
                                                    router.get(
                                                        attendance.index(),
                                                        { search, batch_id: batchId },
                                                        { preserveState: true },
                                                    );
                                                }}
                                                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                <X className="size-4" />
                                            </button>
                                        )}
                                    </div>
                                </FilterBar>
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
                title="Delete Attendance Record"
                description="Are you sure you want to delete this attendance record?"
                confirmText="Delete"
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

AttendanceIndex.layout = {
    breadcrumbs: [
        {
            title: 'Attendance',
            href: attendance.index(),
        },
    ],
};