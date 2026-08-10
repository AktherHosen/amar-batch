import { Head, router, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { useState } from 'react';

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

type PageProps = {
    batches: Batch[];
    attendanceSummary: AttendanceSummary;
    feeSummary: FeeSummary;
    enrollmentSummary: EnrollmentSummary;
    studentSummary: StudentSummary;
    attendanceTrend: TrendData[];
    feeTrend: TrendData[];
    enrollmentTrend: TrendData[];
    batchPerformance: BatchPerformance[];
    filters: { batch_id?: string; month?: string; year?: string };
};

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

export default function ReportsIndex({
    batches,
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
    const [batchId, setBatchId] = useState(filters.batch_id || '');
    const [month, setMonth] = useState(filters.month || String(new Date().getMonth() + 1));
    const [year, setYear] = useState(filters.year || String(new Date().getFullYear()));

    const applyFilters = (newBatchId?: string, newMonth?: string, newYear?: string) => {
        const params: Record<string, string> = {};
        if (newBatchId ?? batchId) params.batch_id = newBatchId ?? batchId;
        params.month = newMonth ?? month;
        params.year = newYear ?? year;
        router.get(reports.index(), params, { preserveState: true });
    };

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
                data: [attendanceSummary.present, attendanceSummary.absent, attendanceSummary.late],
                backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(234, 179, 8, 0.8)'],
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

    const totalAttendance = attendanceSummary.present + attendanceSummary.absent + attendanceSummary.late;

    return (
        <>
            <Head title={t('reports.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading title={t('reports.title')} description={t('reports.desc')} />
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Select
                                value={batchId}
                                onValueChange={(value) => {
                                    setBatchId(value === 'all' ? '' : value);
                                    applyFilters(value === 'all' ? '' : value);
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder={t('reports.all_batches')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('reports.all_batches')}</SelectItem>
                                    {batches.map((batch) => (
                                        <SelectItem key={batch.id} value={String(batch.id)}>
                                            {batch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={month}
                                onValueChange={(value) => {
                                    setMonth(value);
                                    applyFilters(undefined, value);
                                }}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((m, i) => (
                                        <SelectItem key={i} value={String(i + 1)}>
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={year}
                                onValueChange={(value) => {
                                    setYear(value);
                                    applyFilters(undefined, undefined, value);
                                }}
                            >
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((y) => (
                                        <SelectItem key={y} value={String(y)}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">{t('reports.total_students')}</div>
                            <div className="text-2xl font-bold">{studentSummary.total}</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                {studentSummary.active} active, {studentSummary.inactive} inactive
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">{t('reports.attendance_rate')}</div>
                            <div className="text-2xl font-bold">
                                {totalAttendance > 0 ? Math.round((attendanceSummary.present / totalAttendance) * 100) : 0}%
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                {attendanceSummary.present} present / {totalAttendance} total
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">{t('reports.fees_collected')}</div>
                            <div className="text-2xl font-bold">{formatCurrency(feeSummary.total_collected)}</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                {formatCurrency(feeSummary.total_due)} due, {feeSummary.unpaid} unpaid
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">{t('reports.active_enrollments')}</div>
                            <div className="text-2xl font-bold">{enrollmentSummary.active}</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                {enrollmentSummary.completed} completed, {enrollmentSummary.dropped} dropped
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">{t('reports.attendance_trend')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <Bar data={attendanceChartData} options={chartOptions} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">{t('reports.fee_collection_trend')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <Line data={feeChartData} options={chartOptions} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">{t('reports.enrollment_trend')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px]">
                                <Bar data={enrollmentChartData} options={chartOptions} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">{t('reports.attendance_breakdown')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px]">
                                <Doughnut data={attendanceDoughnutData} options={chartOptions} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Batch Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{t('reports.batch_performance')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="sticky left-0 z-10 min-w-[150px] bg-background">{t('reports.batch_name')}</TableHead>
                                    <TableHead>{t('reports.active_students')}</TableHead>
                                    <TableHead>{t('reports.fees_collected')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {batchPerformance.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                                            {t('reports.no_batches')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    batchPerformance.map((batch) => (
                                        <TableRow key={batch.id}>
                                            <TableCell className="sticky left-0 z-10 min-w-[150px] bg-background font-medium whitespace-nowrap">
                                                {batch.name}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{batch.active_students}</TableCell>
                                            <TableCell className="whitespace-nowrap">{formatCurrency(batch.total_fees_collected)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ReportsIndex.layout = {
    breadcrumbs: [{ title: 'Reports', href: reports.index() }],
};
