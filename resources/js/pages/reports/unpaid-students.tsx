import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { FilterBar } from '@/components/filter-bar';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { RefreshButton } from '@/components/refresh-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useLocale } from '@/contexts/locale-context';
import reports from '@/routes/reports';

type UnpaidStudent = {
    id: number;
    name: string;
    phone: string;
    coaching_class: string | null;
    default_fee: number;
    batches: { id: number; name: string }[];
};

type PaginatedStudents = {
    data: UnpaidStudent[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
};

type PageProps = {
    students: PaginatedStudents;
    batches: { id: number; name: string }[];
    monthNames: Record<number, string>;
    filters: {
        month?: string;
        year?: string;
        batch_id?: string;
    };
};

export default function UnpaidStudentsReport({
    students,
    batches,
    monthNames,
    filters,
}: PageProps) {
    const { t } = useLocale();
    const [refreshing, setRefreshing] = useState(false);

    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const currentMonth = Number(filters.month) || new Date().getMonth() + 1;
    const currentYear = Number(filters.year) || new Date().getFullYear();
    const currentBatchId = filters.batch_id || '';

    const [selectedMonth, setSelectedMonth] = useState(String(currentMonth));
    const [selectedYear, setSelectedYear] = useState(String(currentYear));
    const [selectedBatchId, setSelectedBatchId] = useState(currentBatchId);

    const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const activeFilterCount =
        (Number(selectedMonth) !== new Date().getMonth() + 1 ? 1 : 0) +
        (Number(selectedYear) !== currentYear ? 1 : 0) +
        (selectedBatchId ? 1 : 0);

    const applyFilters = (overrides?: { month?: string; year?: string; batch_id?: string }) => {
        const params: Record<string, string> = {};
        const m = overrides?.month ?? selectedMonth;
        const y = overrides?.year ?? selectedYear;
        const b = overrides?.batch_id ?? selectedBatchId;

        if (m) params.month = m;
        if (y) params.year = y;
        if (b) params.batch_id = b;

        router.get(reports.unpaidStudents.url(), params, { preserveState: true });
    };

    const handleClearAll = () => {
        setSelectedMonth(String(new Date().getMonth() + 1));
        setSelectedYear(String(currentYear));
        setSelectedBatchId('');
        router.get(reports.unpaidStudents.url(), {}, { preserveState: true });
    };

    const totalDue = students.data.reduce((sum, s) => sum + s.default_fee, 0);

    return (
        <>
            <Head title={t('reports.unpaid_title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title={t('reports.unpaid_title')}
                        description={t('reports.unpaid_desc')}
                    />
                    <div className="flex items-center gap-1">
                        <RefreshButton
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                router.reload({
                                    only: ['students'],
                                    onFinish: () => setRefreshing(false),
                                });
                            }}
                        />
                    </div>
                </div>

                <Card className="min-w-0">
                    <CardContent className="pt-6">
                        <FilterBar
                            className="mb-4"
                            searchPlaceholder={t('actions.search') + '...'}
                            searchValue=""
                            onSearchChange={() => {}}
                            activeFilterCount={activeFilterCount}
                            active={activeFilterCount > 0}
                            onClearAll={handleClearAll}
                            filters={[
                                {
                                    id: 'month',
                                    placeholder: t('fees.month'),
                                    value: selectedMonth,
                                    options: months.map((m) => ({
                                        label: monthNames[m],
                                        value: String(m),
                                    })),
                                    onValueChange: (v) => {
                                        setSelectedMonth(v);
                                        applyFilters({ month: v });
                                    },
                                },
                                {
                                    id: 'year',
                                    placeholder: t('fees.year'),
                                    value: selectedYear,
                                    options: yearOptions.map((y) => ({
                                        label: String(y),
                                        value: String(y),
                                    })),
                                    onValueChange: (v) => {
                                        setSelectedYear(v);
                                        applyFilters({ year: v });
                                    },
                                },
                                {
                                    id: 'batch',
                                    placeholder: t('fees.batch'),
                                    value: selectedBatchId,
                                    options: batches.map((b) => ({
                                        label: b.name,
                                        value: String(b.id),
                                    })),
                                    onValueChange: (v) => {
                                        setSelectedBatchId(v);
                                        applyFilters({ batch_id: v });
                                    },
                                },
                            ]}
                        />

                        <div className="mb-4 flex flex-wrap gap-3">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                    {students.total} {t('reports.unpaid_students_count')}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="destructive">
                                    ৳{totalDue.toLocaleString()} {t('reports.unpaid_total_due')}
                                </Badge>
                            </div>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="whitespace-nowrap sticky left-0 bg-background z-10 min-w-[180px]">
                                            {t('fees.student')}
                                        </TableHead>
                                        <TableHead className="whitespace-nowrap">
                                            Phone
                                        </TableHead>
                                        <TableHead className="whitespace-nowrap">
                                            Class
                                        </TableHead>
                                        <TableHead className="whitespace-nowrap">
                                            {t('fees.batch')}
                                        </TableHead>
                                        <TableHead className="whitespace-nowrap text-right">
                                            {t('reports.due_amount')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                {t('reports.no_unpaid_students')}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        students.map((student) => (
                                            <TableRow key={student.id}>
                                                <TableCell className="whitespace-nowrap font-medium sticky left-0 bg-background z-10">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                                                            {student.name
                                                                .split(' ')
                                                                .map((n) => n[0])
                                                                .join('')
                                                                .toUpperCase()
                                                                .slice(0, 2)}
                                                        </span>
                                                        {student.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    {student.phone || '-'}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    {student.coaching_class || '-'}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    {student.batches.length > 0
                                                        ? student.batches.map((b) => b.name).join(', ')
                                                        : '-'}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap text-right font-semibold text-destructive">
                                                    ৳{student.default_fee.toLocaleString()}
                                                </TableCell>
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

UnpaidStudentsReport.layout = {
    breadcrumbs: [
        {
            title: 'Reports',
            href: '/reports',
        },
        {
            title: 'Unpaid Students',
            href: '/reports/unpaid-students',
        },
    ],
};
