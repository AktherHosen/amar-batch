import { Head, Link, router, usePage } from '@inertiajs/react';
import { EllipsisVertical, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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
import { DatePicker } from '@/components/ui/date-picker';
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useLocale } from '@/contexts/locale-context';
import { isOwner, isStaff } from '@/lib/role';
import attendance from '@/routes/attendance';

type AttendanceRecord = {
    id: number;
    student: {
        id: number;
        name: string;
        coaching_class: { id: number; name: string } | null;
        section?: string | null;
    };
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
    const { t, formatDate } = useLocale();
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

    const handleFilter = (overrideDate?: string) => {
        router.get(
            attendance.index(),
            { search, batch_id: batchId, date: overrideDate ?? date },
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

    const handleStatusChange = (record: AttendanceRecord, value: string) => {
        if (value === record.status) {
return;
}

        router.put(
            attendance.update(record.id),
            { status: value, notes: record.notes },
            {
                preserveState: true,
                onSuccess: () => {
                    toast.success(t('toast.updated_successfully'));
                    router.reload({ only: ['attendances'] });
                },
            },
        );
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
            'default' | 'secondary' | 'destructive' | 'warning'
        > = {
            present: 'default',
            late: 'warning',
            absent: 'destructive',
        };

        return variants[status] || 'secondary';
    };

    const columns = (() => {
        type Col = NonNullable<
            DataTableProps<AttendanceRecord, unknown>['columns']
        >[number];

        return [
            {
                id: 'student',
                accessorKey: 'student.name',
                header: t('attendance.student'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => {
                    const record: AttendanceRecord = row.original;
                    const cls = record.student.coaching_class
                        ? record.student.coaching_class.name
                        : '';
                    const clsWithSection =
                        cls && record.student.section
                            ? `${cls} - ${record.student.section}`
                            : cls;

                    return (
                        <div className="flex flex-col">
                            <span className="font-medium">
                                {record.student.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {[clsWithSection, record.batch.name]
                                    .filter(Boolean)
                                    .join(' • ')}
                            </span>
                        </div>
                    );
                },
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
                cell: ({ row }: any) => {
                    const record: AttendanceRecord = row.original;

                    if (!isAdmin && !isTeacher) {
                        return (
                            <Badge variant={getStatusBadge(record.status)}>
                                {record.status}
                            </Badge>
                        );
                    }

                    return (
                        <Select
                            value={record.status}
                            onValueChange={(value) =>
                                handleStatusChange(record, value)
                            }
                        >
                            <SelectTrigger className="h-8 w-auto min-w-[7rem] capitalize">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="present">
                                    <span className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-green-600" />
                                        {t('attendance.present')}
                                    </span>
                                </SelectItem>
                                <SelectItem value="late">
                                    <span className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-yellow-500" />
                                        {t('attendance.late')}
                                    </span>
                                </SelectItem>
                                <SelectItem value="absent">
                                    <span className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-red-600" />
                                        {t('attendance.absent')}
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    );
                },
            } as Col,
            {
                id: 'notes',
                accessorKey: 'notes',
                header: t('attendance.notes'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const notes = row.original.notes;

                    if (!notes) {
return '-';
}

                    return (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="block max-w-[200px] cursor-default truncate">
                                    {notes}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>{notes}</TooltipContent>
                        </Tooltip>
                    );
                },
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
                                                  router.get(
                                                      attendance.edit(
                                                          record.id,
                                                      ),
                                                  )
                                              }
                                          >
                                              <Pencil className="mr-2 size-4" />
                                              Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                              className="text-destructive focus:text-destructive"
                                              onClick={() =>
                                                  handleDelete(record)
                                              }
                                          >
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
                <div className="flex items-start justify-between">
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
                            <PageActions
                                isAdmin={isAdmin || isTeacher}
                                createLabel={t('attendance.create')}
                                onCreate={() => router.get(attendance.create())}
                                exportTitle={t('attendance.title')}
                                exportFilename="attendance"
                                exportHeaders={[
                                    t('students.name'),
                                    t('batches.name'),
                                    t('attendance.date'),
                                    t('attendance.status'),
                                    t('attendance.notes'),
                                ]}
                                exportRows={pagination.data.map((a) => [
                                    a.student.name,
                                    a.batch.name,
                                    a.date ? formatDate(a.date) : '',
                                    a.status,
                                    a.notes || '',
                                ])}
                                importUrl="/attendance/import"
                                importFields={[
                                    'student_id',
                                    'batch_id',
                                    'date',
                                    'status',
                                    'notes',
                                ]}
                                onImportSuccess={() =>
                                    router.reload({ only: ['attendances'] })
                                }
                            />
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
                            itemName={t('attendance.title').toLowerCase()}
                            baseUrl={attendance.index().url}
                            preserveParams={{ search, batch_id: batchId, date }}
                            emptyMessage="No attendance records found"
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
                                    customFilters={
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-muted-foreground">
                                                {t('attendance.date')}
                                            </label>
                                            <div className="relative">
                                                <DatePicker
                                                    value={date}
                                                    onValueChange={(value) => {
                                                        setDate(value);
                                                        handleFilter(value);
                                                    }}
                                                    placeholder={t(
                                                        'attendance.date',
                                                    )}
                                                />
                                                {date && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setDate('');
                                                            router.get(
                                                                attendance.index(),
                                                                {
                                                                    search,
                                                                    batch_id:
                                                                        batchId,
                                                                },
                                                                {
                                                                    preserveState: true,
                                                                },
                                                            );
                                                        }}
                                                        className="absolute top-1/2 right-9 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    >
                                                        <X className="size-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    }
                                ></FilterBar>
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
