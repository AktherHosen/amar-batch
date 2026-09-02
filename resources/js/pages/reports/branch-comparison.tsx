import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Building2, Users, Layers, Wallet, CalendarCheck, ChevronUp, ChevronDown } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLocale } from '@/contexts/locale-context';
import reports from '@/routes/reports';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type BranchData = {
    id: number;
    name: string;
    code: string | null;
    is_active: boolean;
    students: number;
    batches: number;
    enrollments: number;
    fees_collected_month: number;
    fees_collected_total: number;
    attendance_rate: number;
};

type Totals = {
    students: number;
    batches: number;
    enrollments: number;
    fees_collected_month: number;
    fees_collected_total: number;
    avg_attendance: number;
};

type PageProps = {
    branches: BranchData[];
    totals: Totals;
};

type SortKey = keyof BranchData;
type SortDir = 'asc' | 'desc';

export default function BranchComparison({ branches, totals }: PageProps) {
    const { t, formatCurrency } = useLocale();
    const [sortKey, setSortKey] = useState<SortKey>('students');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    const sortedBranches = [...branches].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
            return sortDir === 'asc' ? (aVal === bVal ? 0 : aVal ? -1 : 1) : (aVal === bVal ? 0 : aVal ? 1 : -1);
        }
        return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    };

    const SortIcon = ({ column }: { column: SortKey }) => {
        if (sortKey !== column) return null;
        return sortDir === 'asc' ? <ChevronUp className="ml-1 inline size-3" /> : <ChevronDown className="ml-1 inline size-3" />;
    };

    const chartLabels = branches.map((b) => b.name);
    const studentsChartData = {
        labels: chartLabels,
        datasets: [
            {
                label: t('reports.total_students') || 'Students',
                data: branches.map((b) => b.students),
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
            },
        ],
    };

    const feesChartData = {
        labels: chartLabels,
        datasets: [
            {
                label: t('reports.fees_collected') || 'Fees Collected',
                data: branches.map((b) => b.fees_collected_month),
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' as const },
        },
        scales: {
            y: { beginAtZero: true },
        },
    };

    return (
        <>
            <Head title={t('reports.branch_comparison') || 'Branch Comparison'} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="size-8 p-0" onClick={() => router.get(reports.index())}>
                        <ArrowLeft className="size-4" />
                    </Button>
                    <Heading
                        title={t('reports.branch_comparison') || 'Branch Comparison'}
                        description={t('reports.branch_comparison_desc') || 'Compare performance across branches'}
                    />
                </div>

                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="size-4" />
                                {t('reports.total_students') || 'Total Students'}
                            </div>
                            <div className="mt-1 text-2xl font-bold">{totals.students}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Layers className="size-4" />
                                {t('reports.total_batches') || 'Total Batches'}
                            </div>
                            <div className="mt-1 text-2xl font-bold">{totals.batches}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Wallet className="size-4" />
                                {t('reports.fees_collected') || 'Fees Collected (Month)'}
                            </div>
                            <div className="mt-1 text-2xl font-bold">{formatCurrency(totals.fees_collected_month)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CalendarCheck className="size-4" />
                                {t('reports.attendance_rate') || 'Avg Attendance'}
                            </div>
                            <div className="mt-1 text-2xl font-bold">{totals.avg_attendance.toFixed(1)}%</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                {t('reports.students_by_branch') || 'Students by Branch'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <Bar data={studentsChartData} options={chartOptions} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                {t('reports.fees_by_branch') || 'Fees Collected by Branch (This Month)'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <Bar data={feesChartData} options={chartOptions} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            {t('reports.branch_details') || 'Branch Details'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead
                                            className="cursor-pointer select-none whitespace-nowrap"
                                            onClick={() => handleSort('name')}
                                        >
                                            {t('reports.branch_name') || 'Branch Name'}
                                            <SortIcon column="name" />
                                        </TableHead>
                                        <TableHead className="whitespace-nowrap">
                                            {t('reports.code') || 'Code'}
                                        </TableHead>
                                        <TableHead className="whitespace-nowrap">
                                            {t('reports.status') || 'Status'}
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer select-none whitespace-nowrap"
                                            onClick={() => handleSort('students')}
                                        >
                                            {t('reports.students') || 'Students'}
                                            <SortIcon column="students" />
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer select-none whitespace-nowrap"
                                            onClick={() => handleSort('batches')}
                                        >
                                            {t('reports.batches') || 'Batches'}
                                            <SortIcon column="batches" />
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer select-none whitespace-nowrap"
                                            onClick={() => handleSort('enrollments')}
                                        >
                                            {t('reports.enrollments') || 'Enrollments'}
                                            <SortIcon column="enrollments" />
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer select-none whitespace-nowrap"
                                            onClick={() => handleSort('fees_collected_month')}
                                        >
                                            {t('reports.fees_month') || 'Fees (Month)'}
                                            <SortIcon column="fees_collected_month" />
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer select-none whitespace-nowrap"
                                            onClick={() => handleSort('fees_collected_total')}
                                        >
                                            {t('reports.fees_total') || 'Fees (Total)'}
                                            <SortIcon column="fees_collected_total" />
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer select-none whitespace-nowrap"
                                            onClick={() => handleSort('attendance_rate')}
                                        >
                                            {t('reports.attendance') || 'Attendance %'}
                                            <SortIcon column="attendance_rate" />
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedBranches.map((branch) => (
                                        <TableRow key={branch.id}>
                                            <TableCell className="whitespace-nowrap font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="size-4 text-muted-foreground" />
                                                    {branch.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-muted-foreground">
                                                {branch.code || '-'}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <Badge variant={branch.is_active ? 'success' : 'danger'}>
                                                    {branch.is_active ? (t('common.active') || 'Active') : (t('common.inactive') || 'Inactive')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{branch.students}</TableCell>
                                            <TableCell className="whitespace-nowrap">{branch.batches}</TableCell>
                                            <TableCell className="whitespace-nowrap">{branch.enrollments}</TableCell>
                                            <TableCell className="whitespace-nowrap">{formatCurrency(branch.fees_collected_month)}</TableCell>
                                            <TableCell className="whitespace-nowrap">{formatCurrency(branch.fees_collected_total)}</TableCell>
                                            <TableCell className="whitespace-nowrap">{branch.attendance_rate.toFixed(1)}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

BranchComparison.layout = {
    breadcrumbs: [
        { title: 'Reports', href: reports.index().url },
        { title: 'Branch Comparison', href: '#' },
    ],
};
