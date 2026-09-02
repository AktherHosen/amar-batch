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
import { DataTable, type DataTableProps } from '@/components/data-table';
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

export default function BranchComparison({ branches, totals }: PageProps) {
    const { t, formatCurrency } = useLocale();

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

    const columns = (() => {
        type Col = NonNullable<DataTableProps<BranchData, unknown>['columns']>[number];

        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: t('reports.branch_name') || 'Branch Name',
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <div className="flex items-center gap-2 whitespace-nowrap font-medium">
                        <Building2 className="size-4 text-muted-foreground" />
                        {row.original.name}
                    </div>
                ),
            } as Col,
            {
                id: 'code',
                accessorKey: 'code',
                header: t('reports.code') || 'Code',
                enableSorting: true,
                cell: ({ row }: any) => (
                    <span className="whitespace-nowrap text-muted-foreground">
                        {row.original.code || '-'}
                    </span>
                ),
            } as Col,
            {
                id: 'status',
                accessorKey: 'is_active',
                header: t('reports.status') || 'Status',
                enableSorting: true,
                cell: ({ row }: any) => (
                    <span className="whitespace-nowrap">
                        <Badge variant={row.original.is_active ? 'success' : 'danger'}>
                            {row.original.is_active ? (t('common.active') || 'Active') : (t('common.inactive') || 'Inactive')}
                        </Badge>
                    </span>
                ),
            } as Col,
            {
                id: 'students',
                accessorKey: 'students',
                header: t('reports.students') || 'Students',
                enableSorting: true,
                cell: ({ row }: any) => <span className="whitespace-nowrap">{row.original.students}</span>,
            } as Col,
            {
                id: 'batches',
                accessorKey: 'batches',
                header: t('reports.batches') || 'Batches',
                enableSorting: true,
                cell: ({ row }: any) => <span className="whitespace-nowrap">{row.original.batches}</span>,
            } as Col,
            {
                id: 'enrollments',
                accessorKey: 'enrollments',
                header: t('reports.enrollments') || 'Enrollments',
                enableSorting: true,
                cell: ({ row }: any) => <span className="whitespace-nowrap">{row.original.enrollments}</span>,
            } as Col,
            {
                id: 'fees_collected_month',
                accessorKey: 'fees_collected_month',
                header: t('reports.fees_month') || 'Fees (Month)',
                enableSorting: true,
                cell: ({ row }: any) => <span className="whitespace-nowrap">{formatCurrency(row.original.fees_collected_month)}</span>,
            } as Col,
            {
                id: 'fees_collected_total',
                accessorKey: 'fees_collected_total',
                header: t('reports.fees_total') || 'Fees (Total)',
                enableSorting: true,
                cell: ({ row }: any) => <span className="whitespace-nowrap">{formatCurrency(row.original.fees_collected_total)}</span>,
            } as Col,
            {
                id: 'attendance_rate',
                accessorKey: 'attendance_rate',
                header: t('reports.attendance') || 'Attendance %',
                enableSorting: true,
                cell: ({ row }: any) => <span className="whitespace-nowrap">{row.original.attendance_rate.toFixed(1)}%</span>,
            } as Col,
        ];
    })();

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
                        <CardHeader>
                            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                                {t('reports.total_students') || 'Total Students'}
                            </CardTitle>
                            <Users className="size-3.5 text-muted-foreground sm:size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold sm:text-2xl">{totals.students}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                                {t('reports.total_batches') || 'Total Batches'}
                            </CardTitle>
                            <Layers className="size-3.5 text-muted-foreground sm:size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold sm:text-2xl">{totals.batches}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                                {t('reports.fees_collected') || 'Fees Collected (Month)'}
                            </CardTitle>
                            <Wallet className="size-3.5 text-muted-foreground sm:size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold sm:text-2xl">{formatCurrency(totals.fees_collected_month)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                                {t('reports.attendance_rate') || 'Avg Attendance'}
                            </CardTitle>
                            <CalendarCheck className="size-3.5 text-muted-foreground sm:size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold sm:text-2xl">{totals.avg_attendance.toFixed(1)}%</div>
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
                        <DataTable
                            columns={columns}
                            data={branches}
                            total={branches.length}
                            itemName="branches"
                            emptyMessage="No branches found."
                            getRowId={(row) => String(row.id)}
                            enableSorting={true}
                            enableColumnVisibility={false}
                        />
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
