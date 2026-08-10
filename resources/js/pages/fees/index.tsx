import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { isOwner } from '@/lib/role';
import {
    Plus,
    RefreshCw,
    Search,
    Trash2,
    EllipsisVertical,
    Download,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
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
            toast.success('Fee records deleted successfully');
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
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('fees.title')}
                        description={t('fees.title')}
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
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
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleSearch()
                                    }
                                    className="pr-9 pl-9"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            router.get(
                                                fees.index.url(),
                                                {
                                                    search: '',
                                                    year: selectedYear,
                                                },
                                                { preserveState: true },
                                            );
                                        }}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-3 sm:gap-4">
                                <select
                                    value={selectedYear}
                                    onChange={(e) =>
                                        handleYearChange(Number(e.target.value))
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-[120px]"
                                >
                                    {yearOptions.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    variant="secondary"
                                    onClick={handleSearch}
                                >
                                    <Search className="size-4 sm:mr-2" />
                                    <span className="hidden sm:inline">
                                        {t('actions.search')}
                                    </span>
                                </Button>
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
                                <TableBody>
                                    {feeGrid.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={months.length + 4}
                                                className="text-center"
                                            >
                                                No fee records found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        feeGrid.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="sticky left-0 z-10 bg-background font-medium">
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
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
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
                title="Delete Fee Records"
                description="Delete all fee records for this student in this batch for the year?"
                confirmText="Delete"
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
