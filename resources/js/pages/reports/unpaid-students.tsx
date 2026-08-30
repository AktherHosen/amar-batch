import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { DataTable } from '@/components/data-table';
import type { DataTableProps } from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import Heading from '@/components/heading';
import { RefreshButton } from '@/components/refresh-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';
import reports from '@/routes/reports';

type UnpaidStudent = {
    id: number;
    name: string;
    phone: string;
    coaching_class: string | null;
    default_fee: number;
    unpaid_months: number;
    total_due: number;
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
    const { t, formatCurrency } = useLocale();
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const now = new Date();
    const currentMonth = Number(filters.month) || now.getMonth() + 1;
    const currentYear = Number(filters.year) || now.getFullYear();
    const currentBatchId = filters.batch_id || '';

    const [selectedMonth, setSelectedMonth] = useState(String(currentMonth));
    const [selectedYear, setSelectedYear] = useState(String(currentYear));
    const [selectedBatchId, setSelectedBatchId] = useState(currentBatchId);

    useEffect(() => {
        setSelectedMonth(filters.month || '');
        setSelectedYear(filters.year || '');
        setSelectedBatchId(filters.batch_id || '');
        setSearch('');
    }, [filters.month, filters.year, filters.batch_id]);

    const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

    const activeFilterCount =
        (selectedMonth ? 1 : 0) +
        (selectedYear ? 1 : 0) +
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
        router.get(reports.unpaidStudents.url(), {}, { preserveState: true });
    };

    const filteredData = search
        ? students.data.filter(
            (s) =>
                s.name.toLowerCase().includes(search.toLowerCase()) ||
                (s.phone && s.phone.includes(search)) ||
                (s.coaching_class && s.coaching_class.toLowerCase().includes(search.toLowerCase())),
        )
        : students.data;

    const totalDue = students.data.reduce((sum, s) => sum + Number(s.total_due || 0), 0);

    const columns = (() => {
        type Col = NonNullable<
            DataTableProps<UnpaidStudent, unknown>['columns']
        >[number];

        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: t('fees.student'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <div className="flex items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                            {row.original.name
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                        </span>
                        <span className="font-medium">{row.original.name}</span>
                    </div>
                ),
            } as Col,
            {
                id: 'phone',
                accessorKey: 'phone',
                header: 'Phone',
                enableSorting: false,
                cell: ({ row }: any) => (
                    <span>{row.original.phone || '-'}</span>
                ),
            } as Col,
            {
                id: 'coaching_class',
                accessorKey: 'coaching_class',
                header: 'Class',
                enableSorting: false,
                cell: ({ row }: any) => (
                    <span>{row.original.coaching_class || '-'}</span>
                ),
            } as Col,
            {
                id: 'batches',
                accessorKey: 'batches',
                header: t('fees.batch'),
                enableSorting: false,
                cell: ({ row }: any) => (
                    <span>
                        {row.original.batches.length > 0
                            ? row.original.batches.map((b: any) => b.name).join(', ')
                            : '-'}
                    </span>
                ),
            } as Col,
            {
                id: 'unpaid_months',
                accessorKey: 'unpaid_months',
                header: 'Unpaid Months',
                enableSorting: true,
                cell: ({ row }: any) => (
                    <span>{row.original.unpaid_months}</span>
                ),
            } as Col,
            {
                id: 'total_due',
                accessorKey: 'total_due',
                header: t('reports.due_amount'),
                enableSorting: true,
                cell: ({ row }: any) => (
                    <span className="font-semibold text-destructive">
                        {formatCurrency(row.original.total_due)}
                    </span>
                ),
            } as Col,
        ];
    })();

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
                        <DataTable
                            columns={columns}
                            data={filteredData}
                            loading={refreshing}
                            total={students.total}
                            currentPage={students.current_page}
                            lastPage={students.last_page}
                            baseUrl={reports.unpaidStudents.url()}
                            preserveParams={{
                                ...(filters.month && { month: filters.month }),
                                ...(filters.year && { year: filters.year }),
                                ...(filters.batch_id && { batch_id: filters.batch_id }),
                            }}
                            itemName="students"
                            emptyMessage={t('reports.no_unpaid_students')}
                            getRowId={(row) => String(row.id)}
                            searchable
                            searchPlaceholder={t('actions.search') + '...'}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder={t('actions.search') + '...'}
                                    searchValue={search}
                                    onSearchChange={setSearch}
                                    activeFilterCount={activeFilterCount}
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
                            }
                            toolbarEnd={
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                        {students.total} {t('reports.unpaid_students_count')}
                                    </Badge>
                                    <Badge variant="destructive">
                                        {t('reports.unpaid_total_due')}: {formatCurrency(totalDue)}
                                    </Badge>
                                </div>
                            }
                        />
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
