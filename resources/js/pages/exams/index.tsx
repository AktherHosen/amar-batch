import Heading from '@/components/heading';
import { isOwner } from '@/lib/role';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale } from '@/contexts/locale-context';
import exams from '@/routes/exams';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { EllipsisVertical, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable, type DataTableProps } from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import { RefreshButton } from '@/components/refresh-button';

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
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

export default function ExamsIndex({ exams: pagination, batches, filters }: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage().props;
    const isAdmin = isOwner(auth.user);
    const [search, setSearch] = useState(filters.search || '');
    const [batchId, setBatchId] = useState(filters.batch_id || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Exam | null }>({ open: false, item: null });

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(exams.index(), { search: value, batch_id: batchId }, { preserveState: true });
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

    const activeFilterCount = batchId ? 1 : 0;

    const columns = (() => {
        type Col = NonNullable<DataTableProps<Exam, unknown>['columns']>[number];
        return [
            {
                id: 'title',
                accessorKey: 'title',
                header: t('exams.title'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">{row.original.title}</span>
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
                    <>{row.original.total_marks} (pass: {row.original.passing_marks})</>
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
                                <Button variant="ghost" size="sm" className="size-8 p-0">
                                    <EllipsisVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.get(exams.show(exam.id))}>
                                    <Eye className="mr-2 size-4" />
                                    {t('actions.view')}
                                </DropdownMenuItem>
                                {isAdmin && (
                                    <>
                                        <DropdownMenuItem onClick={() => router.get(exams.edit(exam.id))}>
                                            <Pencil className="mr-2 size-4" />
                                            {t('actions.edit')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(exam)}>
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
                    <Heading title={t('exams.title')} description={t('exams.desc')} />
                    <div className="flex items-center gap-1">
                        <RefreshButton refreshing={refreshing} onRefresh={handleRefresh} />
                        {isAdmin && (
                            <Link href={exams.create()}>
                                <Button>
                                    <Plus className="mr-2 size-4" />
                                    {t('exams.create')}
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
                            itemName={t('exams.title').toLowerCase() + 's'}
                            baseUrl={exams.index().url}
                            preserveParams={{ search, batch_id: batchId }}
                            emptyMessage={t('exams.no_exams')}
                            getRowId={(row) => String(row.id)}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder={t('actions.search') + '...'}
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
                                                router.get(exams.index(), { search, batch_id: value }, { preserveState: true });
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
                onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
                title={t('confirm.are_you_sure')}
                description={t('exams.delete_confirm')}
                confirmText={t('confirm.delete')}
                onConfirm={confirmDelete}
            />
        </>
    );
}

ExamsIndex.layout = {
    breadcrumbs: [{ title: 'Exams', href: exams.index() }],
};