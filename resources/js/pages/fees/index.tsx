import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { isOwner } from '@/lib/role';
import {
    Plus,
    Trash2,
    EllipsisVertical,
    Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { DataTable, type DataTableProps } from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import { RefreshButton } from '@/components/refresh-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import fees from '@/routes/fees';
import { useLocale } from '@/contexts/locale-context';

type Student = {
    id: number;
    name: string;
    coaching_class: { id: number; name: string } | null;
};

type Batch = {
    id: number;
    name: string;
};

type FeeRecord = {
    id: number;
    student_id: number;
    batch_id: number;
    month: number;
    year: number;
    amount_paid: number;
    notes: string | null;
};

type FeeGridItem = {
    student: Student;
    batch: Batch;
    enrolled_at: string | null;
    months: Record<number, FeeRecord>;
};

type PageProps = {
    auth: { user: { role: string } };
    feeGrid: FeeGridItem[];
    students: Student[];
    batches: Batch[];
    months: number[];
    monthNames: Record<number, string>;
    year: number;
    filters: {
        search?: string;
        year?: string;
    };
};

function FeeCell({
    fee,
    studentId,
    batchId,
    month,
    year,
    isAdmin,
    disabled,
}: {
    fee: FeeRecord | undefined;
    studentId: number;
    batchId: number;
    month: number;
    year: number;
    isAdmin: boolean;
    disabled: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    if (disabled) {
        return <span className="text-muted-foreground"></span>;
    }

    const handleSave = (value: string) => {
        setEditing(false);
        const numValue = value === '' ? 0 : parseFloat(value);

        if ((value === '' || numValue === 0) && fee) {
            router.delete(fees.destroy.url(fee.id), { preserveState: true });

            return;
        }

        if (numValue > 0) {
            if (fee) {
                router.put(
                    fees.update.url(fee.id),
                    {
                        student_id: fee.student_id,
                        batch_id: fee.batch_id,
                        month: fee.month,
                        year: fee.year,
                        amount_paid: numValue,
                    },
                    { preserveState: true },
                );
            } else {
                router.post(
                    fees.index.url(),
                    {
                        student_id: studentId,
                        batch_id: batchId,
                        month: month,
                        year: year,
                        amount_paid: numValue,
                    },
                    { preserveState: true },
                );
            }
        }
    };

    if (!isAdmin) {
        return (
            <span
                className={
                    fee && fee.amount_paid > 0
                        ? 'font-medium text-green-600'
                        : 'text-muted-foreground'
                }
            >
                {fee && fee.amount_paid > 0
                    ? Number(fee.amount_paid).toFixed(0)
                    : '-'}
            </span>
        );
    }

    if (editing) {
        return (
            <Input
                ref={inputRef}
                type="number"
                min="0"
                className="h-8 w-[70px] text-center text-sm"
                defaultValue={fee ? fee.amount_paid : ''}
                placeholder="0"
                onBlur={(e) => handleSave(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleSave(e.currentTarget.value);
                    } else if (e.key === 'Escape') {
                        setEditing(false);
                    }
                }}
                autoFocus
            />
        );
    }

    return (
        <button
            type="button"
            className={`h-8 w-[70px] cursor-text rounded-md border border-transparent px-2 text-center text-sm transition-colors hover:border-border hover:bg-muted ${
                fee && fee.amount_paid > 0
                    ? 'font-medium text-green-600'
                    : 'text-muted-foreground'
            }`}
            onClick={() => setEditing(true)}
        >
            {fee && fee.amount_paid > 0
                ? Number(fee.amount_paid).toFixed(0)
                : '0'}
        </button>
    );
}

export default function FeesIndex({
    feeGrid,
    months,
    monthNames,
    year,
    filters,
}: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const isAdmin = isOwner(auth.user);
    const [search, setSearch] = useState(filters.search || '');
    const [selectedYear, setSelectedYear] = useState(year);
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: { studentId: number; batchId: number } | null;
    }>({ open: false, item: null });

    const currentYear = new Date().getFullYear();
    const yearOptions = [];

    for (let y = currentYear - 2; y <= currentYear + 1; y++) {
        yearOptions.push(y);
    }

    const isMonthDisabled = (
        enrolledAt: string | null,
        month: number,
        year: number,
    ): boolean => {
        if (!enrolledAt) {
            return false;
        }

        const enrollDate = new Date(enrolledAt);
        const enrollYear = enrollDate.getFullYear();
        const enrollMonth = enrollDate.getMonth() + 1;

        if (year < enrollYear) {
            return true;
        }

        if (year === enrollYear && month < enrollMonth) {
            return true;
        }

        return false;
    };

    const handleDeleteRow = (studentId: number, batchId: number) => {
        setDeleteDialog({ open: true, item: { studentId, batchId } });
    };

    const confirmDeleteRow = () => {
        if (deleteDialog.item) {
            const { studentId, batchId } = deleteDialog.item;
            const feeIds = feeGrid
                .filter(
                    (item) =>
                        item.student.id === studentId &&
                        item.batch.id === batchId,
                )
                .flatMap((item) => Object.values(item.months).map((f) => f.id));
            feeIds.forEach((id) => {
                router.delete(fees.destroy.url(id), { preserveState: true });
            });
            toast.success(t('toast.deleted_successfully'));
            setDeleteDialog({ open: false, item: null });
        }
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            fees.index.url(),
            { search: value, year: selectedYear },
            { preserveState: true },
        );
    };

    const handleYearChange = (value: string) => {
        const newYear = value ? Number(value) : currentYear;
        setSelectedYear(newYear);
        router.get(
            fees.index.url(),
            { search, year: newYear },
            { preserveState: true },
        );
    };

    const clearAll = () => {
        setSearch('');
        setSelectedYear(currentYear);
        router.get(fees.index.url(), {}, { preserveState: true });
    };

    const activeFilterCount = selectedYear !== currentYear ? 1 : 0;

    const exportToExcel = () => {
        const headers = [
            'Student',
            'Class',
            'Batch',
            ...months.map((m) => monthNames[m]),
            'Total',
        ];
        const rows = feeGrid.map((item) => {
            const total = months.reduce((sum, m) => {
                const fee = item.months[m];

                return sum + (fee ? Number(fee.amount_paid) : 0);
            }, 0);

            return [
                item.student.name,
                item.student.coaching_class?.name || '',
                item.batch.name,
                ...months.map((m) => {
                    const fee = item.months[m];

                    return fee ? Number(fee.amount_paid) : 0;
                }),
                total,
            ];
        });
        const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fees-${year}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const columns = (() => {
        type Col = NonNullable<DataTableProps<FeeGridItem, unknown>['columns']>[number];
        const cols: Col[] = [
            {
                id: 'student',
                accessorKey: 'student.name',
                header: t('fees.student'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">{row.original.student.name}</span>
                ),
            } as Col,
            {
                id: 'class',
                accessorKey: 'student.coaching_class.name',
                header: t('students.class'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const item: FeeGridItem = row.original;
                    return (
                        <span>
                            {item.student.coaching_class?.name || '-'}
                        </span>
                    );
                },
            } as Col,
            {
                id: 'batch',
                accessorKey: 'batch.name',
                header: t('batches.name'),
                enableSorting: false,
                cell: ({ row }: any) => (
                    <span>{row.original.batch.name}</span>
                ),
            } as Col,
            ...months.map(
                (m) =>
                    ({
                        id: `month_${m}`,
                        accessorKey: `months.${m}`,
                        header: monthNames[m].slice(0, 3),
                        enableSorting: false,
                        cell: ({ row }: any) => {
                            const item: FeeGridItem = row.original;
                            return (
                                <div className="flex justify-center">
                                    <FeeCell
                                        fee={item.months[m]}
                                        studentId={item.student.id}
                                        batchId={item.batch.id}
                                        month={m}
                                        year={year}
                                        isAdmin={isAdmin}
                                        disabled={isMonthDisabled(
                                            item.enrolled_at,
                                            m,
                                            year,
                                        )}
                                    />
                                </div>
                            );
                        },
                    }) as Col,
            ),
        ];

        if (isAdmin) {
            cols.push({
                id: 'actions',
                header: '',
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }: any) => {
                    const item: FeeGridItem = row.original;
                    return (
                        <div className="flex justify-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteRow(item.student.id, item.batch.id)}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    );
                },
            } as Col);
        }

        return cols;
    })();

    return (
        <>
            <Head title={t('fees.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                        <h2 className="text-xl font-semibold tracking-tight">
                            {t('fees.title')}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {t('fees.desc')}
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        <RefreshButton
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                router.reload({
                                    only: ['feeGrid'],
                                    onFinish: () => setRefreshing(false),
                                });
                            }}
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8 p-0">
                                    <EllipsisVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {isAdmin && (
                                    <DropdownMenuItem asChild>
                                        <Link href={fees.create.url()}>
                                            <Plus className="mr-2 size-4" />
                                            {t('fees.create')}
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={exportToExcel}>
                                    <Download className="mr-2 size-4" />
                                    {t('fees.export')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <DataTable
                            columns={columns}
                            data={feeGrid}
                            loading={refreshing}
                            currentPage={1}
                            lastPage={1}
                            total={feeGrid.length}
                            itemName={t('fees.title').toLowerCase()}
                            baseUrl={fees.index.url()}
                            preserveParams={{ search, year: selectedYear }}
                            showPagination={false}
                            emptyMessage={t('fees.no_records')}
                            getRowId={(row) => `${row.student.id}_${row.batch.id}`}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder={t('actions.search') + '...'}
                                    searchValue={search}
                                    onSearchChange={handleSearch}
                                    activeFilterCount={activeFilterCount}
                                    onClearAll={clearAll}
                                    filters={[
                                        {
                                            id: 'year',
                                            placeholder: t('fees.year'),
                                            value: String(selectedYear),
                                            options: yearOptions.map((y) => ({
                                                label: String(y),
                                                value: String(y),
                                            })),
                                            onValueChange: handleYearChange,
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
                title={t('fees.delete_title')}
                description={t('fees.delete_confirm')}
                confirmText={t('actions.delete')}
                cancelText={t('actions.cancel')}
                variant="destructive"
                onConfirm={confirmDeleteRow}
            />
        </>
    );
}

FeesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Fees',
            href: fees.index.url(),
        },
    ],
};