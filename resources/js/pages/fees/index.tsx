import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { isOwner } from '@/lib/role';
import {
    Plus,
    RefreshCw,
    Search,
    Trash2,
    EllipsisVertical,
    Download,
    X,
    Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import fees from '@/routes/fees';
import { useLocale } from '@/contexts/locale-context';

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
    let timer: ReturnType<typeof setTimeout>;
    const debounced = (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
    debounced.cancel = () => clearTimeout(timer);
    return debounced;
}

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

    const debouncedSearch = useCallback(
        debounce((value: string, yearValue: number) => {
            router.get(fees.index.url(), { search: value, year: yearValue }, { preserveState: true });
        }, 300),
        [],
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: { studentId: number; batchId: number } | null;
    }>({ open: false, item: null });

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

    const handleSearch = () => {
        router.get(
            fees.index.url(),
            { search, year: selectedYear },
            { preserveState: true },
        );
    };

    const handleYearChange = (newYear: number) => {
        setSelectedYear(newYear);
        router.get(
            fees.index.url(),
            { search, year: newYear },
            { preserveState: true },
        );
    };

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

    const yearOptions = [];
    const currentYear = new Date().getFullYear();

    for (let y = currentYear - 2; y <= currentYear + 1; y++) {
        yearOptions.push(y);
    }

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

                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder={t('actions.search') + '...'}
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        debouncedSearch(e.target.value, selectedYear);
                                    }}
                                    className="pr-9 pl-9"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            router.get(
                                                fees.index.url(),
                                                { search: '', year: selectedYear },
                                                { preserveState: true },
                                            );
                                        }}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Select
                                    value={String(selectedYear)}
                                    onValueChange={(value) => handleYearChange(Number(value))}
                                >
                                    <SelectTrigger className="w-full sm:w-[120px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {yearOptions.map((y) => (
                                            <SelectItem key={y} value={String(y)}>
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={refreshing}
                                    onClick={() => {
                                        setRefreshing(true);
                                        router.reload({
                                            only: ['feeGrid'],
                                            onFinish: () => setRefreshing(false),
                                        });
                                    }}
                                >
                                    <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="sticky left-0 z-10 min-w-[150px] bg-background">
                                            {t('fees.student')}
                                        </TableHead>
                                        <TableHead className="min-w-[100px]">
                                            {t('students.class')}
                                        </TableHead>
                                        <TableHead className="min-w-[100px]">
                                            {t('batches.name')}
                                        </TableHead>
                                        {months.map((m) => (
                                            <TableHead
                                                key={m}
                                                className="min-w-[80px] text-center"
                                            >
                                                {monthNames[m].slice(0, 3)}
                                            </TableHead>
                                        ))}
                                        {isAdmin && (
                                            <TableHead className="w-[50px]"></TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <motion.tbody
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        hidden: {},
                                        visible: { transition: { staggerChildren: 0.03 } },
                                    }}
                                >
                                    {feeGrid.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={months.length + 4}
                                                className="text-center"
                                            >
                                                <div className="flex flex-col items-center gap-2 py-4">
                                                    <Wallet className="size-8 text-muted-foreground" />
                                                    <p>{t('fees.no_records')}</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        feeGrid.map((item, idx) => (
                                            <motion.tr
                                                key={idx}
                                                variants={{
                                                    hidden: { opacity: 0, x: -8 },
                                                    visible: { opacity: 1, x: 0 },
                                                }}
                                            >
                                                <TableCell className="sticky left-0 z-10 min-w-[150px] bg-background font-medium">
                                                    {item.student.name}
                                                </TableCell>
                                                <TableCell>
                                                    {item.student.coaching_class
                                                        ?.name || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {item.batch.name}
                                                </TableCell>
                                                {months.map((m) => (
                                                    <TableCell
                                                        key={m}
                                                        className="p-1 text-center"
                                                    >
                                                        <FeeCell
                                                            fee={item.months[m]}
                                                            studentId={
                                                                item.student.id
                                                            }
                                                            batchId={
                                                                item.batch.id
                                                            }
                                                            month={m}
                                                            year={year}
                                                            isAdmin={isAdmin}
                                                            disabled={isMonthDisabled(
                                                                item.enrolled_at,
                                                                m,
                                                                year,
                                                            )}
                                                        />
                                                    </TableCell>
                                                ))}
                                                {isAdmin && (
                                                    <TableCell className="p-1 text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                            onClick={() => handleDeleteRow(item.student.id, item.batch.id)}
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </TableCell>
                                                )}
                                            </motion.tr>
                                        ))
                                    )}
                                </motion.tbody>
                            </Table>
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
