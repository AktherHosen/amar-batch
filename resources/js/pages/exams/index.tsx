import { Head, router, useForm, usePage } from '@inertiajs/react';
import { EllipsisVertical, Eye, PenLine, Plus, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import CellTitle from '@/components/cell-title';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable  } from '@/components/data-table';
import type {DataTableProps} from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PageActions from '@/components/page-actions';
import { RefreshButton } from '@/components/refresh-button';
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
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/contexts/locale-context';
import { isOwner } from '@/lib/role';
import exams from '@/routes/exams';

type Exam = {
    id: number;
    title: string;
    subject: string | null;
    batch: { id: number; name: string } | null;
    date: string | null;
    total_marks: number;
    passing_marks: number;
    created_at: string;
};

type Batch = {
    id: number;
    name: string;
};

type PageProps = {
    exams: {
        data: Exam[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    batches: Batch[];
    filters: { search?: string; batch_id?: string };
};

function formatDate(dateStr: string | null): string {
    if (!dateStr) {
return '-';
}

    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
}

export default function ExamsIndex({
    exams: pagination,
    batches,
    filters,
}: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage().props;
    const isAdmin = isOwner(auth.user);
    const [search, setSearch] = useState(filters.search || '');
    const [batchId, setBatchId] = useState(filters.batch_id || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: Exam | null;
    }>({ open: false, item: null });
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Exam | null>(null);
    const [batchModalOpen, setBatchModalOpen] = useState(false);
    const [newBatchName, setNewBatchName] = useState('');
    const [batchCreating, setBatchCreating] = useState(false);
    const [batchErrors, setBatchErrors] = useState<Record<string, string>>({});
    const [localBatches, setLocalBatches] = useState<Batch[]>(batches);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        subject: '',
        batch_id: '',
        date: '',
        total_marks: '100',
        passing_marks: '40',
        notes: '',
    });

    const handleCreate = () => {
        setEditingItem(null);
        reset();
        setData({
            title: '',
            subject: '',
            batch_id: '',
            date: '',
            total_marks: '100',
            passing_marks: '40',
            notes: '',
        });
        setSheetOpen(true);
    };

    const handleEdit = (exam: Exam) => {
        setEditingItem(exam);
        setData({
            title: exam.title,
            subject: exam.subject || '',
            batch_id: exam.batch ? String(exam.batch.id) : '',
            date: exam.date ? exam.date.split('T')[0] : '',
            total_marks: String(exam.total_marks),
            passing_marks: String(exam.passing_marks),
            notes: '',
        });
        setSheetOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingItem) {
            put(exams.update(editingItem.id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('toast.updated_successfully'));
                    setSheetOpen(false);
                    setEditingItem(null);
                },
            });
        } else {
            post(exams.store(), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('toast.created_successfully'));
                    setSheetOpen(false);
                },
            });
        }
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            exams.index(),
            { search: value, batch_id: batchId },
            { preserveState: true },
        );
    };

    const handleRefresh = () => {
        setRefreshing(true);
        router.reload({
            onFinish: () => setRefreshing(false),
        });
    };

    const handleDelete = (exam: Exam) => {
        setDeleteDialog({ open: true, item: exam });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(exams.destroy(deleteDialog.item.id));
            toast.success(t('toast.deleted_successfully'));
            setDeleteDialog({ open: false, item: null });
        }
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
            setData('batch_id', String(createdBatch.id));
            setNewBatchName('');
            setBatchModalOpen(false);
            toast.success(resData.message || 'Batch created successfully.');
        } catch {
            toast.error('An error occurred while creating batch.');
        } finally {
            setBatchCreating(false);
        }
    };

    const activeFilterCount = batchId ? 1 : 0;

    const columns = (() => {
        type Col = NonNullable<
            DataTableProps<Exam, unknown>['columns']
        >[number];

        return [
            {
                id: 'title',
                accessorKey: 'title',
                header: t('exams.title'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <CellTitle
                        title={row.original.title}
                        href={exams.show(row.original.id).url}
                    />
                ),
            } as Col,
            {
                id: 'subject',
                accessorKey: 'subject',
                header: t('exams.subject'),
                enableSorting: false,
                cell: ({ row }: any) => row.original.subject || '-',
            } as Col,
            {
                id: 'batch',
                accessorKey: 'batch.name',
                header: t('exams.batch'),
                enableSorting: false,
                cell: ({ row }: any) => row.original.batch?.name || '-',
            } as Col,
            {
                id: 'date',
                accessorKey: 'date',
                header: t('exams.date'),
                enableSorting: false,
                cell: ({ row }: any) => formatDate(row.original.date),
            } as Col,
            {
                id: 'marks',
                accessorKey: 'total_marks',
                header: t('exams.marks'),
                enableSorting: false,
                cell: ({ row }: any) => (
                    <>
                        {row.original.total_marks} (pass:{' '}
                        {row.original.passing_marks})
                    </>
                ),
            } as Col,
            {
                id: 'actions',
                header: '',
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }: any) => {
                    const exam: Exam = row.original;

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
                                        router.get(exams.show(exam.id))
                                    }
                                >
                                    <Eye className="mr-2 size-4" />
                                    {t('actions.view')}
                                </DropdownMenuItem>
                                {isAdmin && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() => handleEdit(exam)}
                                        >
                                            <PenLine className="mr-2 size-4" />
                                            {t('actions.edit')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => handleDelete(exam)}
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
            <Head title={t('exams.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('exams.title')}
                        description={t('exams.desc')}
                    />
                    <div className="flex items-center gap-1">
                        <RefreshButton
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                        />
                        <PageActions
                            isAdmin={isAdmin}
                            createLabel={t('exams.create')}
                            onCreate={handleCreate}
                            exportTitle={t('exams.title')}
                            exportFilename="exams"
                            exportHeaders={[
                                t('exams.title'),
                                t('exams.subject'),
                                t('exams.batch'),
                                t('exams.date'),
                                t('exams.marks'),
                            ]}
                            exportRows={pagination.data.map((e) => [
                                e.title,
                                e.subject || '-',
                                e.batch?.name || '-',
                                formatDate(e.date),
                                `${e.total_marks} (pass: ${e.passing_marks})`,
                            ])}
                            importUrl="/exams/import"
                            importFields={[
                                'title',
                                'subject',
                                'batch_id',
                                'date',
                                'total_marks',
                                'passing_marks',
                            ]}
                            onImportSuccess={() =>
                                router.reload({ only: ['exams'] })
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
                            itemName={t('exams.title').toLowerCase()}
                            baseUrl={exams.index().url}
                            preserveParams={{ search, batch_id: batchId }}
                            emptyMessage={t('exams.no_exams')}
                            getRowId={(row) => String(row.id)}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder={
                                        t('actions.search') + '...'
                                    }
                                    searchValue={search}
                                    onSearchChange={handleSearch}
                                    activeFilterCount={activeFilterCount}
                                    filters={[
                                        {
                                            id: 'batch_id',
                                            placeholder: t('exams.all_batches'),
                                            value: batchId,
                                            options: batches.map((batch) => ({
                                                label: batch.name,
                                                value: String(batch.id),
                                            })),
                                            onValueChange: (value) => {
                                                setBatchId(value);
                                                router.get(
                                                    exams.index(),
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
                    setDeleteDialog({ ...deleteDialog, open })
                }
                title={t('confirm.are_you_sure')}
                description={t('exams.delete_confirm')}
                confirmText={t('confirm.delete')}
                onConfirm={confirmDelete}
            />

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {editingItem ? t('exams.edit') : t('exams.create')}
                        </SheetTitle>
                        <SheetDescription>
                            {editingItem
                                ? t('exams.update_details')
                                : t('exams.desc')}
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-4">
                        <div className="space-y-2">
                            <Label htmlFor="sheet-title">
                                {t('exams.title')} *
                            </Label>
                            <Input
                                id="sheet-title"
                                value={data.title}
                                onChange={(e) =>
                                    setData('title', e.target.value)
                                }
                                placeholder={t('exams.title_placeholder')}
                            />
                            <InputError message={errors.title} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sheet-subject">
                                {t('exams.subject')}
                            </Label>
                            <Input
                                id="sheet-subject"
                                value={data.subject}
                                onChange={(e) =>
                                    setData('subject', e.target.value)
                                }
                                placeholder={t('exams.subject_placeholder')}
                            />
                            <InputError message={errors.subject} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('exams.batch')}</Label>
                            <div className="flex gap-1.5 items-center">
                                <SearchableSelect
                                    options={localBatches.map((batch) => ({
                                        value: String(batch.id),
                                        label: batch.name,
                                        searchText: batch.name,
                                    }))}
                                    value={data.batch_id}
                                    onValueChange={(value) => setData('batch_id', value)}
                                    placeholder={t('exams.select_batch')}
                                    emptyText="No batches available"
                                    noResultsText="No batches found"
                                    className="w-full flex-1"
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
                                                <Label htmlFor="new_batch_name">
                                                    Batch Name *
                                                </Label>
                                                <Input
                                                    id="new_batch_name"
                                                    value={newBatchName}
                                                    onChange={(e) => setNewBatchName(e.target.value)}
                                                    placeholder="e.g. Class 5 - Science"
                                                />
                                                <InputError message={batchErrors.name} />
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
                            <InputError message={errors.batch_id} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sheet-date">
                                {t('exams.date')}
                            </Label>
                            <DatePicker
                                value={data.date}
                                onValueChange={(value) =>
                                    setData('date', value)
                                }
                                placeholder={t('exams.date')}
                            />
                            <InputError message={errors.date} />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="sheet-total_marks">
                                    {t('exams.total_marks')} *
                                </Label>
                                <Input
                                    id="sheet-total_marks"
                                    type="number"
                                    min="1"
                                    value={data.total_marks}
                                    onChange={(e) =>
                                        setData('total_marks', e.target.value)
                                    }
                                />
                                <InputError message={errors.total_marks} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sheet-passing_marks">
                                    {t('exams.passing_marks')} *
                                </Label>
                                <Input
                                    id="sheet-passing_marks"
                                    type="number"
                                    min="0"
                                    value={data.passing_marks}
                                    onChange={(e) =>
                                        setData('passing_marks', e.target.value)
                                    }
                                />
                                <InputError message={errors.passing_marks} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sheet-notes">
                                {t('exams.notes')}
                            </Label>
                            <Textarea
                                id="sheet-notes"
                                value={data.notes}
                                onChange={(e) =>
                                    setData('notes', e.target.value)
                                }
                                placeholder={t('exams.notes_placeholder')}
                            />
                            <InputError message={errors.notes} />
                        </div>
                    </form>
                    <SheetFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSheetOpen(false)}
                        >
                            {t('actions.cancel')}
                        </Button>
                        <Button type="submit" disabled={processing} onClick={handleSubmit}>
                            {processing
                                ? editingItem
                                    ? t('actions.updating')
                                    : t('actions.creating')
                                : editingItem
                                  ? t('actions.update')
                                  : t('actions.create')}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}

ExamsIndex.layout = {
    breadcrumbs: [{ title: 'Exams', href: exams.index() }],
};
