import { Head, router, usePage } from '@inertiajs/react';
import { EllipsisVertical, Loader2, PenLine, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable  } from '@/components/data-table';
import type {DataTableProps} from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import FormSheet from '@/components/form-sheet';
import Heading from '@/components/heading';
import PageActions from '@/components/page-actions';
import { RefreshButton } from '@/components/refresh-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
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
    const [editSheet, setEditSheet] = useState<{
        open: boolean;
        item: AttendanceRecord | null;
    }>({ open: false, item: null });
    const [editStatus, setEditStatus] = useState<'present' | 'absent' | 'late'>('present');
    const [editNotes, setEditNotes] = useState('');
    const [createSheet, setCreateSheet] = useState(false);
    const [createBatchId, setCreateBatchId] = useState('');
    const [createDate, setCreateDate] = useState(new Date().toISOString().split('T')[0]);
    const [createStudents, setCreateStudents] = useState<{ id: number; name: string; status: 'present' | 'absent' | 'late' | null; notes: string }[]>([]);
    const [createLoading, setCreateLoading] = useState(false);
    const [localBatches, setLocalBatches] = useState<Batch[]>(batches);
    const [batchModalOpen, setBatchModalOpen] = useState(false);
    const [newBatchName, setNewBatchName] = useState('');
    const [batchCreating, setBatchCreating] = useState(false);
    const [batchErrors, setBatchErrors] = useState<Record<string, string>>({});

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

    const handleEdit = (record: AttendanceRecord) => {
        setEditSheet({ open: true, item: record });
        setEditStatus(record.status);
        setEditNotes(record.notes || '');
    };

    const handleEditSubmit = () => {
        if (!editSheet.item) {
            return;
        }

        router.put(
            attendance.update(editSheet.item.id),
            { status: editStatus, notes: editNotes || null },
            {
                preserveState: true,
                onSuccess: () => {
                    toast.success(t('toast.updated_successfully'));
                    setEditSheet({ open: false, item: null });
                    router.reload({ only: ['attendances'] });
                },
            },
        );
    };

    const fetchStudents = async (batchId: string, date: string) => {
        if (!batchId) {
            setCreateStudents([]);

            return;
        }

        setCreateLoading(true);

        try {
            const response = await fetch(`/attendance/students?batch_id=${batchId}&date=${date}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                toast.error('Failed to load students.');
                setCreateStudents([]);

                return;
            }

            const data = await response.json();
            setCreateStudents(data);
        } catch {
            toast.error('Failed to load students.');
            setCreateStudents([]);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleCreateDateChange = (value: string) => {
        setCreateDate(value);
        fetchStudents(createBatchId, value);
    };

    const updateCreateStatus = (studentId: number, status: 'present' | 'absent' | 'late' | null) => {
        setCreateStudents((prev) =>
            prev.map((s) => (s.id === studentId ? { ...s, status } : s)),
        );
    };

    const markAllCreate = (status: 'present' | 'absent' | 'late' | null) => {
        setCreateStudents((prev) => prev.map((s) => ({ ...s, status })));
    };

    const handleCreateSubmit = () => {
        if (!createBatchId || !createDate || createStudents.length === 0) {
            return;
        }

        router.post(attendance.store(), {
            batch_id: parseInt(createBatchId),
            date: createDate,
            attendances: createStudents.map((s) => ({
                student_id: s.id,
                status: s.status,
                notes: s.notes || null,
            })),
        }, {
            preserveState: true,
            onSuccess: () => {
                toast.success(t('toast.created_successfully'));
                setCreateSheet(false);
                setCreateBatchId('');
                setCreateStudents([]);
                router.reload({ only: ['attendances'] });
            },
        });
    };

    const handleCreateBatch = async (e?: React.SyntheticEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        setBatchCreating(true);
        setBatchErrors({});

        try {
            const xsrfToken = decodeURIComponent(
                document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
            );

            const response = await fetch('/batches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken,
                },
                body: JSON.stringify({
                    name: newBatchName,
                    capacity: 30,
                    status: 'active',
                }),
            });

            const resData = await response.json();

            if (!response.ok) {
                if (response.status === 422 && resData.errors) {
                    const formattedErrors: Record<string, string> = {};
                    Object.entries(resData.errors).forEach(([k, msgs]: [string, any]) => {
                        formattedErrors[k] = Array.isArray(msgs) ? msgs[0] : String(msgs);
                    });
                    setBatchErrors(formattedErrors);
                } else {
                    toast.error(resData.message || 'Failed to create batch.');
                }

                return;
            }

            const createdBatch = resData.batch || resData;
            setLocalBatches((prev) => [...prev, { id: createdBatch.id, name: createdBatch.name }]);
            setCreateBatchId(String(createdBatch.id));
            setNewBatchName('');
            setBatchModalOpen(false);
            toast.success(resData.message || 'Batch created successfully.');

            fetchStudents(String(createdBatch.id), createDate);
        } catch {
            toast.error('An error occurred while creating batch.');
        } finally {
            setBatchCreating(false);
        }
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
                                                  handleEdit(record)
                                              }
                                          >
                                               <PenLine className="mr-2 size-4" />
                                               {t('actions.edit')}
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                              className="text-destructive focus:text-destructive"
                                              onClick={() =>
                                                  handleDelete(record)
                                              }
                                          >
                                               <Trash2 className="mr-2 size-4" />
                                               {t('actions.delete')}
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
                                onCreate={() => setCreateSheet(true)}
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

            <FormSheet
                open={createSheet}
                onOpenChange={setCreateSheet}
                title={t('attendance.mark')}
                description={t('attendance.desc')}
                onSubmit={handleCreateSubmit}
                submitLabel={t('attendance.save')}
                submitDisabled={createLoading || createStudents.length === 0}
                wide
            >
                <div className="space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="flex-1 space-y-2">
                            <Label>{t('attendance.batch')}</Label>
                            <div className="flex gap-2">
                                <SearchableSelect
                                    options={localBatches.map((b) => ({ value: b.id.toString(), label: b.name }))}
                                    value={createBatchId}
                                    onValueChange={(v) => {
                                        setCreateBatchId(v);
                                        fetchStudents(v, createDate);
                                    }}
                                    placeholder="Select a batch"
                                    className="flex-1"
                                />
                                <Dialog open={batchModalOpen} onOpenChange={setBatchModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="size-9 shrink-0"
                                        >
                                            <Plus className="size-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Batch</DialogTitle>
                                            <DialogDescription>
                                                Quickly add a new batch without leaving this form.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleCreateBatch(e);
                                                }
                                            }}
                                            className="space-y-4"
                                        >
                                            <div className="space-y-2">
                                                <Label htmlFor="new_batch_name">Batch Name *</Label>
                                                <Input
                                                    id="new_batch_name"
                                                    value={newBatchName}
                                                    onChange={(e) => setNewBatchName(e.target.value)}
                                                    placeholder="e.g. Class 5 - Science"
                                                />
                                                {batchErrors.name && (
                                                    <p className="text-sm text-destructive">{batchErrors.name}</p>
                                                )}
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setBatchModalOpen(false)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={handleCreateBatch}
                                                    disabled={batchCreating || !newBatchName.trim()}
                                                >
                                                    {batchCreating && (
                                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                                    )}
                                                    Create Batch
                                                </Button>
                                            </DialogFooter>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                        <div className="w-full space-y-2 sm:w-auto sm:max-w-[200px]">
                            <Label>{t('attendance.date')}</Label>
                            <DatePicker
                                value={createDate}
                                onValueChange={handleCreateDateChange}
                                placeholder={t('attendance.date')}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {createLoading ? (
                        <p className="text-sm text-muted-foreground">Loading students...</p>
                    ) : createBatchId && createStudents.length > 0 ? (
                        <>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 sm:flex-none"
                                    onClick={() => markAllCreate('present')}
                                >
                                    {t('attendance.mark_all_present')}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 sm:flex-none"
                                    onClick={() => markAllCreate('absent')}
                                >
                                    {t('attendance.mark_all_absent')}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 sm:flex-none"
                                    onClick={() => markAllCreate(null)}
                                >
                                    {t('attendance.clear_all')}
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {createStudents.map((student) => (
                                    <div
                                        key={student.id}
                                        className="flex items-center gap-3 rounded-lg border p-3"
                                    >
                                        <span className="min-w-0 flex-1 truncate text-sm font-medium">
                                            {student.name}
                                        </span>
                                        <div className="flex shrink-0 gap-1">
                                            <Button
                                                size="sm"
                                                variant={student.status === 'present' ? 'default' : 'outline'}
                                                className="px-2"
                                                onClick={() => updateCreateStatus(student.id, 'present')}
                                            >
                                                P
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={student.status === 'absent' ? 'destructive' : 'outline'}
                                                className="px-2"
                                                onClick={() => updateCreateStatus(student.id, 'absent')}
                                            >
                                                A
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={student.status === 'late' ? 'secondary' : 'outline'}
                                                className="px-2"
                                                onClick={() => updateCreateStatus(student.id, 'late')}
                                            >
                                                L
                                            </Button>
                                            {student.status !== null && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="px-2"
                                                    onClick={() => updateCreateStatus(student.id, null)}
                                                >
                                                    ✕
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : createBatchId ? (
                        <p className="text-sm text-muted-foreground">
                            No enrolled students found for this batch.
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Select a batch and date to mark attendance.
                        </p>
                    )}
                </div>
            </FormSheet>

            <FormSheet
                open={editSheet.open}
                onOpenChange={(open) => setEditSheet({ open, item: editSheet.item })}
                title="Edit Attendance"
                description={editSheet.item ? `${editSheet.item.student.name} - ${editSheet.item.batch.name}` : undefined}
                onSubmit={handleEditSubmit}
            >
                {editSheet.item && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Student</p>
                                <p className="font-medium">{editSheet.item.student.name}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Batch</p>
                                <p className="font-medium">{editSheet.item.batch.name}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Date</p>
                                <p className="font-medium">{new Date(editSheet.item.date).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={editStatus === 'present' ? 'default' : 'outline'}
                                    onClick={() => setEditStatus('present')}
                                >
                                    Present
                                </Button>
                                <Button
                                    size="sm"
                                    variant={editStatus === 'absent' ? 'destructive' : 'outline'}
                                    onClick={() => setEditStatus('absent')}
                                >
                                    Absent
                                </Button>
                                <Button
                                    size="sm"
                                    variant={editStatus === 'late' ? 'secondary' : 'outline'}
                                    onClick={() => setEditStatus('late')}
                                >
                                    Late
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Input
                                placeholder="Optional notes..."
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </FormSheet>
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
