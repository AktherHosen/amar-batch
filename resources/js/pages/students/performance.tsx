import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Award, CalendarCheck, FileSignature } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLocale } from '@/contexts/locale-context';
import { getGrade, getGradeBadgeVariant } from '@/lib/grades';
import students from '@/routes/students';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Filler,
    Tooltip,
    Legend,
);

type ExamResult = {
    id: number;
    exam_title: string;
    subject: string;
    date: string | null;
    marks_obtained: number;
    total_marks: number;
    passing_marks: number;
    percentage: number;
};

type AttendanceByMonth = Record<string, Record<string, Record<string, number>>>;

type PageProps = {
    student: { id: number; name: string; coaching_class: { name: string } | null };
    examResults: ExamResult[];
    attendanceByMonth: AttendanceByMonth;
    attendancePercent: number;
    avgPercentage: number;
    batchRank: number | null;
    batchTotal: number;
};

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

const MONTH_NAMES = [
    '',
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

export default function StudentPerformance({
    student,
    examResults,
    attendanceByMonth,
    attendancePercent,
    avgPercentage,
    batchRank,
    batchTotal,
}: PageProps) {
    const { t } = useLocale();
    const { auth, tenant } = usePage<{ props: { auth: { user: { role: string } }; tenant: { primary_color: string; name: string } | null } }>().props;

    const sortedExams = [...examResults].sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const examChartData = sortedExams.length > 0
        ? {
            labels: sortedExams.map((e) => formatDate(e.date)),
            datasets: [
                {
                    label: t('students.avg_marks'),
                    data: sortedExams.map((e) => e.percentage),
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
                ...(sortedExams.length > 0
                    ? [
                        {
                            label: 'Pass Line',
                            data: sortedExams.map(
                                (e) =>
                                    e.total_marks > 0
                                        ? (e.passing_marks / e.total_marks) * 100
                                        : 0,
                            ),
                            borderColor: '#dc2626',
                            borderDash: [5, 5],
                            borderWidth: 2,
                            pointRadius: 0,
                            fill: false,
                        },
                    ]
                    : []),
            ],
        }
        : null;

    const examChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' as const, labels: { boxWidth: 10, padding: 8, font: { size: 11 } } },
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 } } },
            y: { grid: { color: '#e5e7eb' }, ticks: { font: { size: 10 } }, beginAtZero: true, max: 100 },
        },
    };

    const allMonths = Object.entries(attendanceByMonth)
        .flatMap(([year, months]) =>
            Object.keys(months).map((month) => ({
                key: `${year}-${month}`,
                year,
                month: Number(month),
                monthName: MONTH_NAMES[Number(month)],
                present: months[month]?.present || 0,
                absent: months[month]?.absent || 0,
                late: months[month]?.late || 0,
            })),
        )
        .sort((a, b) => {
            if (a.year !== b.year) return Number(b.year) - Number(a.year);
            return b.month - a.month;
        })
        .slice(0, 6)
        .reverse();

    const attendanceChartData = allMonths.length > 0
        ? {
            labels: allMonths.map((m) => `${m.monthName} ${m.year}`),
            datasets: [
                {
                    label: t('attendance.present'),
                    data: allMonths.map((m) => m.present),
                    backgroundColor: '#16a34a',
                    borderRadius: 4,
                },
                {
                    label: t('attendance.absent'),
                    data: allMonths.map((m) => m.absent),
                    backgroundColor: '#dc2626',
                    borderRadius: 4,
                },
                {
                    label: t('attendance.late'),
                    data: allMonths.map((m) => m.late),
                    backgroundColor: '#eab308',
                    borderRadius: 4,
                },
            ],
        }
        : null;

    const attendanceChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' as const, labels: { boxWidth: 10, padding: 8, font: { size: 11 } } },
        },
        scales: {
            x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } },
            y: { stacked: true, grid: { color: '#e5e7eb' }, ticks: { font: { size: 10 } }, beginAtZero: true },
        },
    };

    const recentExams = [...examResults]
        .sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        })
        .slice(0, 10);

    const statCards = [
        {
            title: t('students.avg_marks'),
            value: `${avgPercentage.toFixed(1)}%`,
            icon: TrendingUp,
            color: 'text-blue-600',
        },
        {
            title: t('students.attendance_rate'),
            value: `${attendancePercent.toFixed(1)}%`,
            icon: CalendarCheck,
            color: 'text-green-600',
        },
        {
            title: t('students.batch_rank'),
            value: batchRank !== null ? `${batchRank} of ${batchTotal}` : '-',
            icon: Award,
            color: 'text-purple-600',
        },
        {
            title: t('students.exams_taken'),
            value: String(examResults.length),
            icon: FileSignature,
            color: 'text-amber-600',
        },
    ];

    return (
        <>
            <Head title={`${student.name} - ${t('students.performance')}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-2">
                    <Link href={students.show(student.id)} className="shrink-0">
                        <Button variant="ghost" size="icon" className="size-9">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <Heading
                        title={student.name}
                        description={t('students.performance')}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {statCards.map((card, index) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.07 }}
                        >
                            <Card>
                                <CardContent className="flex items-center gap-3 p-4">
                                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted`}>
                                        <card.icon className={`size-5 ${card.color}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">{card.title}</p>
                                        <p className="truncate text-lg font-bold">{card.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.2 }}
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    {t('students.performance')} Trend
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {examChartData ? (
                                    <div className="h-[260px] w-full">
                                        <Line data={examChartData} options={examChartOptions} />
                                    </div>
                                ) : (
                                    <div className="flex h-[260px] w-full flex-col items-center justify-center text-center">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                                            <TrendingUp className="size-5 text-muted-foreground" />
                                        </div>
                                        <p className="mt-2 text-sm font-medium">{t('exams.no_results')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.3 }}
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    {t('attendance.title')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {attendanceChartData ? (
                                    <div className="h-[260px] w-full">
                                        <Bar data={attendanceChartData} options={attendanceChartOptions} />
                                    </div>
                                ) : (
                                    <div className="flex h-[260px] w-full flex-col items-center justify-center text-center">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                                            <CalendarCheck className="size-5 text-muted-foreground" />
                                        </div>
                                        <p className="mt-2 text-sm font-medium">{t('students.no_attendance')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.35 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">
                                {t('exams.title')} ({examResults.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentExams.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="whitespace-nowrap">{t('exams.date')}</TableHead>
                                            <TableHead className="whitespace-nowrap">{t('exams.title')}</TableHead>
                                            <TableHead className="whitespace-nowrap">{t('exams.subject')}</TableHead>
                                            <TableHead className="whitespace-nowrap">{t('exams.marks')}</TableHead>
                                            <TableHead className="whitespace-nowrap">{t('exams.grade')}</TableHead>
                                            <TableHead className="whitespace-nowrap">{t('students.status')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentExams.map((exam) => {
                                            const grade = getGrade(exam.marks_obtained, exam.total_marks);
                                            const passed = exam.marks_obtained >= exam.passing_marks;

                                            return (
                                                <TableRow key={exam.id}>
                                                    <TableCell className="whitespace-nowrap font-medium">
                                                        {formatDate(exam.date)}
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">{exam.exam_title}</TableCell>
                                                    <TableCell className="whitespace-nowrap">{exam.subject}</TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        <span className={`font-medium ${passed ? 'text-green-600' : 'text-red-600'}`}>
                                                            {exam.marks_obtained}/{exam.total_marks}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        <Badge variant={getGradeBadgeVariant(grade)}>{grade}</Badge>
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        <Badge variant={passed ? 'success' : 'destructive'}>
                                                            {passed ? 'Pass' : 'Fail'}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="flex h-32 flex-col items-center justify-center text-center">
                                    <p className="text-sm text-muted-foreground">{t('exams.no_results')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </>
    );
}

StudentPerformance.layout = {
    breadcrumbs: [
        {
            title: 'Students',
            href: students.index(),
        },
        {
            title: 'Performance',
            href: '#',
        },
    ],
};
