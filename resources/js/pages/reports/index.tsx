import { Head, Link, router } from '@inertiajs/react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Building2, Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { DataTable  } from '@/components/data-table';
import type {DataTableProps} from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import Heading from '@/components/heading';
import { RefreshButton } from '@/components/refresh-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useLocale } from '@/contexts/locale-context';
import { useHasFeature } from '@/lib/features';
import reports from '@/routes/reports';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
);

type AttendanceSummary = {
    present: number;
    absent: number;
    late: number;
};

type FeeSummary = {
    total_collected: number;
    total_due: number;
    total_records: number;
    unpaid: number;
};

type EnrollmentSummary = {
    total: number;
    active: number;
    completed: number;
    dropped: number;
};

type StudentSummary = {
    total: number;
    active: number;
    inactive: number;
};

type TrendData = {
    month: string;
    [key: string]: number | string;
};

type BatchPerformance = {
    id: number;
    name: string;
    active_students: number;
    total_fees_collected: number;
};

type Batch = {
    id: number;
    name: string;
};

type Branch = {
    id: number;
    name: string;
};

type PageProps = {
    batches: Batch[];
    branches: Branch[];
    attendanceSummary: AttendanceSummary;
    feeSummary: FeeSummary;
    enrollmentSummary: EnrollmentSummary;
    studentSummary: StudentSummary;
    attendanceTrend: TrendData[];
    feeTrend: TrendData[];
    enrollmentTrend: TrendData[];
    batchPerformance: BatchPerformance[];
    filters: {
        branch_id?: string;
        batch_id?: string;
        month?: string;
        year?: string;
    };
};

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

function BatchSearchSelect({
    batches,
    value,
    onChange,
    placeholder,
}: {
    batches: { id: number; name: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const selected = batches.find((b) => String(b.id) === value);

    const filtered = search
        ? batches.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
        : batches;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="h-9 w-[200px] shrink-0 justify-between"
                >
                    <span className="truncate">{selected ? selected.name : placeholder}</span>
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <div className="border-b p-2">
                    <div className="relative">
                        <Search className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <input
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 w-full rounded-md bg-transparent pl-7 pr-7 text-sm outline-none placeholder:text-muted-foreground"
                            autoFocus
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto p-1">
                    <button
                        type="button"
                        onClick={() => { onChange(''); setOpen(false); setSearch(''); }}
                        className={cn(
                            'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                            !value && 'bg-accent text-accent-foreground',
                        )}
                    >
                        <Check className={cn('size-4', !value ? 'opacity-100' : 'opacity-0')} />
                        {placeholder}
                    </button>
                    {filtered.map((batch) => (
                        <button
                            key={batch.id}
                            type="button"
                            onClick={() => { onChange(String(batch.id)); setOpen(false); setSearch(''); }}
                            className={cn(
                                'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                                String(batch.id) === value && 'bg-accent text-accent-foreground',
                            )}
                        >
                            <Check className={cn('size-4', String(batch.id) === value ? 'opacity-100' : 'opacity-0')} />
                            {batch.name}
                        </button>
                    ))}
                    {filtered.length === 0 && (
                        <p className="px-2 py-1.5 text-sm text-muted-foreground">No batches found</p>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default function ReportsIndex({
    batches,
    branches,
    attendanceSummary,
    feeSummary,
    enrollmentSummary,
    studentSummary,
    attendanceTrend,
    feeTrend,
    enrollmentTrend,
    batchPerformance,
    filters,
}: PageProps) {
    const { t, formatCurrency } = useLocale();
    const hasMultiBranch = useHasFeature('multi_branch');
    const [branchId, setBranchId] = useState(filters.branch_id || '');
    const [batchId, setBatchId] = useState(filters.batch_id || '');
    const [month, setMonth] = useState(
        filters.month || String(new Date().getMonth() + 1),
    );
    const [year, setYear] = useState(
        filters.year || String(new Date().getFullYear()),
    );
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = () => {
        setRefreshing(true);
        router.reload({
            only: [
                'attendanceSummary',
                'feeSummary',
                'enrollmentSummary',
                'studentSummary',
                'attendanceTrend',
                'feeTrend',
                'enrollmentTrend',
                'batchPerformance',
            ],
            onFinish: () => setRefreshing(false),
        });
    };

    const applyFilters = (
        newBranchId?: string,
        newBatchId?: string,
        newMonth?: string,
        newYear?: string,
    ) => {
        const params: Record<string, string> = {};

        if (newBranchId ?? branchId) {
params.branch_id = newBranchId ?? branchId;
}

        if (newBatchId ?? batchId) {
params.batch_id = newBatchId ?? batchId;
}

        params.month = newMonth ?? month;
        params.year = newYear ?? year;
        router.get(reports.index(), params, { preserveState: true });
    };

    const activeFilterCount = (branchId ? 1 : 0) + (month !== String(new Date().getMonth() + 1) ? 1 : 0) + (year !== String(new Date().getFullYear()) ? 1 : 0);

    const attendanceChartData = {
        labels: attendanceTrend.map((d) => d.month),
        datasets: [
            {
                label: 'Present',
                data: attendanceTrend.map((d) => d.present as number),
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
            },
            {
                label: 'Absent',
                data: attendanceTrend.map((d) => d.absent as number),
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
            },
            {
                label: 'Late',
                data: attendanceTrend.map((d) => d.late as number),
                backgroundColor: 'rgba(234, 179, 8, 0.8)',
            },
        ],
    };

    const feeChartData = {
        labels: feeTrend.map((d) => d.month),
        datasets: [
            {
                label: 'Collected',
                data: feeTrend.map((d) => d.collected as number),
                borderColor: 'rgba(34, 197, 94, 1)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
            },
            {
                label: 'Due',
                data: feeTrend.map((d) => d.due as number),
                borderColor: 'rgba(239, 68, 68, 1)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
            },
        ],
    };

    const enrollmentChartData = {
        labels: enrollmentTrend.map((d) => d.month),
        datasets: [
            {
                label: 'Enrollments',
                data: enrollmentTrend.map((d) => d.enrollments as number),
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
            },
        ],
    };

    const attendanceDoughnutData = {
        labels: ['Present', 'Absent', 'Late'],
        datasets: [
            {
                data: [
                    attendanceSummary.present,
                    attendanceSummary.absent,
                    attendanceSummary.late,
                ],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(234, 179, 8, 0.8)',
                ],
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' as const },
        },
    };

    const totalAttendance =
        attendanceSummary.present +
        attendanceSummary.absent +
        attendanceSummary.late;

    const columns = (() => {
        type Col = NonNullable<
            DataTableProps<BatchPerformance, unknown>['columns']
        >[number];

        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: t('reports.batch_name'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">{row.original.name}</span>
                ),
            } as Col,
            {
                id: 'active_students',
                accessorKey: 'active_students',
                header: t('reports.active_students'),
                enableSorting: false,
                cell: ({ row }: any) => (
                    <span>{row.original.active_students}</span>
                ),
            } as Col,
            {
                id: 'total_fees_collected',
                accessorKey: 'total_fees_collected',
                header: t('reports.fees_collected'),
                enableSorting: false,
                cell: ({ row }: any) => (
                    <span>
                        {formatCurrency(row.original.total_fees_collected)}
                    </span>
                ),
            } as Col,
        ];
    })();

    return (
        <>
            <Head title={t('reports.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('reports.title')}
                        description={t('reports.desc')}
                    />
                    <div className="flex items-center gap-1">
                        {hasMultiBranch && (
                            <Link href={reports.branches().url}>
                                <Button variant="outline" size="sm">
                                    <Building2 className="mr-1.5 size-4" />
                                    {t('reports.branch_comparison')}
                                </Button>
                            </Link>
                        )}
                        <RefreshButton
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                        />
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <BatchSearchSelect
                                batches={batches}
                                value={batchId}
                                onChange={(v) => {
                                    setBatchId(v);
                                    applyFilters(undefined, v);
                                }}
                                placeholder={t('reports.all_batches')}
                            />
                            <FilterBar
                                activeFilterCount={activeFilterCount}
                                filters={[
                                    ...(hasMultiBranch
                                        ? [
                                              {
                                                  id: 'branch_id',
                                                  placeholder: t(
                                                      'reports.all_branches',
                                                  ),
                                                  value: branchId,
                                                  options: branches.map(
                                                      (branch) => ({
                                                          label: branch.name,
                                                          value: String(branch.id),
                                                      }),
                                                  ),
                                                  onValueChange: (
                                                      value: string,
                                                  ) => {
                                                      setBranchId(value);
                                                      applyFilters(value);
                                                  },
                                              },
                                          ]
                                        : []),
                                    {
                                        id: 'month',
                                        placeholder: 'Month',
                                        value: month,
                                        options: months.map((m, i) => ({
                                            label: m,
                                            value: String(i + 1),
                                        })),
                                        onValueChange: (value: string) => {
                                            setMonth(value);
                                            applyFilters(
                                                undefined,
                                                undefined,
                                                value,
                                            );
                                        },
                                    },
                                    {
                                        id: 'year',
                                        placeholder: 'Year',
                                        value: year,
                                        options: years.map((y) => ({
                                            label: String(y),
                                            value: String(y),
                                        })),
                                        onValueChange: (value: string) => {
                                            setYear(value);
                                            applyFilters(
                                                undefined,
                                                undefined,
                                                undefined,
                                                value,
                                            );
                                        },
                                    },
                                ]}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">
                                {t('reports.total_students')}
                            </div>
                            <div className="text-xl font-bold sm:text-2xl">
                                {studentSummary.total}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                {studentSummary.active} active,{' '}
                                {studentSummary.inactive} inactive
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">
                                {t('reports.attendance_rate')}
                            </div>
                            <div className="text-xl font-bold sm:text-2xl">
                                {totalAttendance > 0
                                    ? Math.round(
                                          (attendanceSummary.present /
                                              totalAttendance) *
                                              100,
                                      )
                                    : 0}
                                %
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                {attendanceSummary.present} present /{' '}
                                {totalAttendance} total
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">
                                {t('reports.fees_collected')}
                            </div>
                            <div className="text-xl font-bold sm:text-2xl">
                                {formatCurrency(feeSummary.total_collected)}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                {formatCurrency(feeSummary.total_due)} due,{' '}
                                {feeSummary.unpaid} unpaid
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">
                                {t('reports.active_enrollments')}
                            </div>
                            <div className="text-xl font-bold sm:text-2xl">
                                {enrollmentSummary.active}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                {enrollmentSummary.completed} completed,{' '}
                                {enrollmentSummary.dropped} dropped
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                {t('reports.attendance_trend')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <Bar
                                    data={attendanceChartData}
                                    options={chartOptions}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                {t('reports.fee_collection_trend')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <Line
                                    data={feeChartData}
                                    options={chartOptions}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">
                                {t('reports.enrollment_trend')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px]">
                                <Bar
                                    data={enrollmentChartData}
                                    options={chartOptions}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                {t('reports.attendance_breakdown')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px]">
                                <Doughnut
                                    data={attendanceDoughnutData}
                                    options={chartOptions}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Batch Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            {t('reports.batch_performance')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={batchPerformance}
                            loading={refreshing}
                            total={batchPerformance.length}
                            itemName="batches"
                            emptyMessage={t('reports.no_batches')}
                            getRowId={(row) => String(row.id)}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ReportsIndex.layout = {
    breadcrumbs: [{ title: 'Reports', href: reports.index() }],
};
