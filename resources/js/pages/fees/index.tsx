import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, Trash2, MoreHorizontal, Download } from 'lucide-react';
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
                router.put(fees.update.url(fee.id), {
                    student_id: fee.student_id,
                    batch_id: fee.batch_id,
                    month: fee.month,
                    year: fee.year,
                    amount_paid: numValue,
                }, { preserveState: true });
            } else {
                router.post(fees.index.url(), {
                    student_id: studentId,
                    batch_id: batchId,
                    month: month,
                    year: year,
                    amount_paid: numValue,
                }, { preserveState: true });
            }
        }
    };

    if (!isAdmin) {
        return (
            <span className={fee && fee.amount_paid > 0 ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                {fee && fee.amount_paid > 0 ? Number(fee.amount_paid).toFixed(0) : '-'}
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
            className={`h-8 w-[70px] rounded-md border border-transparent px-2 text-center text-sm transition-colors hover:border-border hover:bg-muted cursor-text ${
                fee && fee.amount_paid > 0 ? 'text-green-600 font-medium' : 'text-muted-foreground'
            }`}
            onClick={() => setEditing(true)}
        >
            {fee && fee.amount_paid > 0 ? Number(fee.amount_paid).toFixed(0) : '0'}
        </button>
    );
}

export default function FeesIndex({ feeGrid, months, monthNames, year, filters }: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';
    const [search, setSearch] = useState(filters.search || '');
    const [selectedYear, setSelectedYear] = useState(year);

    const isMonthDisabled = (enrolledAt: string | null, month: number, year: number): boolean => {
        if (!enrolledAt) return false;
        const enrollDate = new Date(enrolledAt);
        const enrollYear = enrollDate.getFullYear();
        const enrollMonth = enrollDate.getMonth() + 1;
        if (year < enrollYear) return true;
        if (year === enrollYear && month < enrollMonth) return true;
        return false;
    };

    const handleDeleteRow = (studentId: number, batchId: number) => {
        if (!confirm('Delete all fee records for this student in this batch for the year?')) return;
        const feeIds = feeGrid
            .filter((item) => item.student.id === studentId && item.batch.id === batchId)
            .flatMap((item) => Object.values(item.months).map((f) => f.id));
        feeIds.forEach((id) => {
            router.delete(fees.destroy.url(id), { preserveState: true });
        });
    };

    const handleSearch = () => {
        router.get(fees.index.url({ search, year: selectedYear }), {}, { preserveState: true });
    };

    const handleYearChange = (newYear: number) => {
        setSelectedYear(newYear);
        router.get(fees.index.url({ search, year: newYear }), {}, { preserveState: true });
    };

    const exportToExcel = () => {
        const headers = ['Student', 'Class', 'Batch', ...months.map((m) => monthNames[m]), 'Total'];
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
                    <Heading title={t('fees.title')} description={t('fees.title')} />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreHorizontal className="size-4" />
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
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder={t('actions.search') + '...'}

                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-9"
                                />
                            </div>
                            <select
                                value={selectedYear}
                                onChange={(e) => handleYearChange(Number(e.target.value))}
                                className="flex h-10 w-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                {yearOptions.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <Button variant="secondary" onClick={handleSearch}>
                                {t('actions.search')}
                            </Button>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="sticky left-0 bg-background z-10 min-w-[150px]">{t('fees.student')}</TableHead>
                                        <TableHead className="min-w-[100px]">{t('students.class')}</TableHead>
                                        <TableHead className="min-w-[100px]">{t('batches.name')}</TableHead>
                                        {months.map((m) => (
                                            <TableHead key={m} className="text-center min-w-[80px]">
                                                {monthNames[m].slice(0, 3)}
                                            </TableHead>
                                        ))}
                                        {isAdmin && <TableHead className="w-[50px]"></TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {feeGrid.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={months.length + 4} className="text-center">
                                                {t('fees.title')} {t('actions.search')}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        feeGrid.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium sticky left-0 bg-background z-10">
                                                    {item.student.name}
                                                </TableCell>
                                                <TableCell>
                                                    {item.student.coaching_class?.name || '-'}
                                                </TableCell>
                                                <TableCell>{item.batch.name}</TableCell>
                                                {months.map((m) => (
                                                    <TableCell key={m} className="text-center p-1">
                                                        <FeeCell
                                                            fee={item.months[m]}
                                                            studentId={item.student.id}
                                                            batchId={item.batch.id}
                                                            month={m}
                                                            year={year}
                                                            isAdmin={isAdmin}
                                                            disabled={isMonthDisabled(item.enrolled_at, m, year)}
                                                        />
                                                    </TableCell>
                                                ))}
                                                {isAdmin && (
                                                    <TableCell className="text-center p-1">
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
