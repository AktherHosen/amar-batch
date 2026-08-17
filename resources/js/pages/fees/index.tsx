import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { isOwner } from '@/lib/role';
import {
    Plus,
    Trash2,
    EllipsisVertical,
    Download,
    ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { DataTable, type DataTableProps } from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import { RefreshButton } from '@/components/refresh-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
    photo: string | null;
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
    yearOptions: number[];
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
        return (
            <span className="inline-flex h-7 w-16 items-center justify-center text-xs text-muted-foreground/40">
                –
            </span>
        );
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
                className={`inline-flex h-7 items-center justify-center rounded-full px-3 text-xs font-semibold ${
                    fee && fee.amount_paid > 0
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-muted text-muted-foreground'
                }`}
            >
                {fee && fee.amount_paid > 0
                    ? `৳${Number(fee.amount_paid).toFixed(0)}`
                    : '—'}
            </span>
        );
    }

    if (editing) {
        return (
            <Input
                ref={inputRef}
                type="number"
                min="0"
                className="h-7 w-16 text-center text-xs"
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

    const paid = fee && fee.amount_paid > 0;

    return (
        <button
            type="button"
            className={`inline-flex h-7 min-w-16 cursor-text items-center justify-center rounded-full px-3 text-xs font-semibold transition-all ${
                paid
                    ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                    : 'border border-dashed border-border bg-muted/40 text-muted-foreground/70 hover:border-muted-foreground/30 hover:bg-muted'
            }`}
            onClick={() => setEditing(true)}
        >
            {paid ? `৳${Number(fee.amount_paid).toFixed(0)}` : '0'}
        </button>
    );
}

function MobileFeeList({
    feeGrid,
    months,
    monthNames,
    year,
    isAdmin,
    isMonthDisabled,
    onDeleteRow,
    t,
}: {
    feeGrid: FeeGridItem[];
    months: number[];
    monthNames: Record<number, string>;
    year: number;
    isAdmin: boolean;
    isMonthDisabled: (enrolledAt: string | null, month: number, year: number) => boolean;
    onDeleteRow: (studentId: number, batchId: number) => void;
    t: (key: string) => string;
}) {
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const toggle = (key: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    return (
        <div className="space-y-2 lg:hidden">
            {feeGrid.map((item) => {
                const key = `${item.student.id}_${item.batch.id}`;
                const isOpen = expanded.has(key);
                const total = months.reduce((sum, m) => {
                    const fee = item.months[m];

                    return sum + (fee ? Number(fee.amount_paid) : 0);
                }, 0);

                return (
                    <div
                        key={key}
                        className="overflow-hidden rounded-lg border bg-card"
                    >
                        <div className="flex items-center">
                            <button
                                type="button"
                                onClick={() => toggle(key)}
                                className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left"
                            >
                                {item.student.photo ? (
                                    <img
                                        src={`/storage/${item.student.photo}`}
                                        alt={item.student.name}
                                        className="size-8 shrink-0 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                                        {item.student.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 2)}
                                    </span>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {item.student.name}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {item.student.coaching_class?.name || '-'}
                                        <span className="mx-1 text-muted-foreground/50">
                                            •
                                        </span>
                                        {item.batch.name}
                                    </p>
                                </div>
                                <ChevronDown
                                    className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                                        isOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {isAdmin && (
                                <div className="flex shrink-0 items-center border-l pl-1 pr-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="size-8 p-0 text-destructive hover:text-destructive"
                                        onClick={() =>
                                            onDeleteRow(item.student.id, item.batch.id)
                                        }
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {isOpen && (
                            <div className="border-t px-3 py-3">
                                <div className="grid grid-cols-4 gap-2">
                                    {months.map((m) => (
                                        <div
                                            key={m}
                                            className="flex flex-col items-center gap-1"
                                        >
                                            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                                {monthNames[m].slice(0, 3)}
                                            </span>
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
                                    ))}
                                </div>
                                <div className="mt-3 flex items-center justify-between border-t pt-2">
                                    <span className="text-xs text-muted-foreground">
                                        {t('fees.total_paid')}
                                    </span>
                                    <span
                                        className={`inline-flex h-7 items-center justify-center rounded-full px-3 text-xs font-bold ${
                                            total > 0
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        ৳{Number(total).toFixed(0)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function FeesIndex({
    feeGrid,
    months,
    monthNames,
    year,
    yearOptions,
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
    const yearOptionsList =
        yearOptions.length > 0 ? yearOptions : [currentYear];

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
            router.delete(fees.clearStudent.url(), {
                data: { student_id: studentId, batch_id: batchId },
                preserveState: true,
                onSuccess: () => {
                    toast.success(t('toast.deleted_successfully'));
                },
                onError: () => {
                    toast.error(t('toast.error_occurred'));
                },
            });
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
                cell: ({ row }: any) => {
                    const item: FeeGridItem = row.original;
                    return (
                        <div className="flex items-center gap-3">
                            {item.student.photo ? (
                                <img
                                    src={`/storage/${item.student.photo}`}
                                    alt={item.student.name}
                                    className="size-8 shrink-0 rounded-full object-cover"
                                />
                            ) : (
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                                    {item.student.name
                                        .split(' ')
                                        .map((n: string) => n[0])
                                        .join('')
                                        .toUpperCase()
                                        .slice(0, 2)}
                                </span>
                            )}
                            <div className="min-w-0">
                                <p className="truncate font-medium">
                                    {item.student.name}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {item.student.coaching_class?.name || '-'}
                                    <span className="mx-1 text-muted-foreground/50">
                                        •
                                    </span>
                                    {item.batch.name}
                                </p>
                            </div>
                        </div>
                    );
                },
            } as Col,
            {
                id: 'paid',
                header: t('fees.paid_months'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const item: FeeGridItem = row.original;
                    const paidCount = months.filter(
                        (m) =>
                            item.months[m] &&
                            Number(item.months[m].amount_paid) > 0,
                    ).length;
                    return (
                        <div className="flex items-center gap-2">
                            <div className="flex h-2 w-16 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-green-500"
                                    style={{
                                        width: `${Math.min((paidCount / months.length) * 100, 100)}%`,
                                    }}
                                />
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {paidCount}/{months.length}
                            </span>
                        </div>
                    );
                },
            } as Col,
            ...months.map(
                (m) =>
                    ({
                        id: `month_${m}`,
                        accessorKey: `months.${m}`,
                        header: () => (
                            <div className="flex flex-col items-center justify-center gap-0.5">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    {monthNames[m].slice(0, 3)}
                                </span>
                            </div>
                        ),
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

        cols.push({
            id: 'total',
            accessorKey: 'total',
            header: () => (
                <div className="flex items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('fees.total_paid')}
                </div>
            ),
            enableSorting: false,
            meta: { stickyRight: true },
            cell: ({ row }: any) => {
                const item: FeeGridItem = row.original;
                const total = months.reduce((sum, m) => {
                    const fee = item.months[m];

                    return sum + (fee ? Number(fee.amount_paid) : 0);
                }, 0);
                return (
                    <div className="flex justify-center">
                        <span
                            className={`inline-flex h-7 items-center justify-center rounded-full px-3 text-xs font-bold ${
                                total > 0
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-muted text-muted-foreground'
                            }`}
                        >
                            ৳{Number(total).toFixed(0)}
                        </span>
                    </div>
                );
            },
        } as Col);

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
                    <Heading
                        title={t('fees.title')}
                        description={t('fees.desc')}
                    />
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

                <Card className="min-w-0">
                    <CardContent className="pt-6">
                        <FilterBar
                            className="mb-4"
                            searchPlaceholder={t('actions.search') + '...'}
                            searchValue={search}
                            onSearchChange={handleSearch}
                            activeFilterCount={activeFilterCount}
                            active={selectedYear !== currentYear}
                            onClearAll={clearAll}
                            filters={[
                                {
                                    id: 'year',
                                    placeholder: t('fees.year'),
                                    value: String(selectedYear),
                                    options: yearOptionsList.map((y) => ({
                                        label: String(y),
                                        value: String(y),
                                    })),
                                    onValueChange: handleYearChange,
                                },
                            ]}
                        />

                        <div className="hidden lg:block">
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
                            />
                        </div>

                        <div className="lg:hidden">
                            <MobileFeeList
                                feeGrid={feeGrid}
                                months={months}
                                monthNames={monthNames}
                                year={year}
                                isAdmin={isAdmin}
                                isMonthDisabled={isMonthDisabled}
                                onDeleteRow={handleDeleteRow}
                                t={t}
                            />
                        </div>
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