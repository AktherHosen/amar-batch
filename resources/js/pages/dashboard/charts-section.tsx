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
import { BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';

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

type AttendanceStat = { present: number; absent: number; late: number };
type AttendanceTrend = { month: string; present: number; absent: number; late: number }[];
type EnrollmentTrend = { month: string; enrollments: number }[];
type FeeTrend = { month: string; collected: number }[];

type Props = {
    todayAttendance: AttendanceStat;
    attendanceTrend: AttendanceTrend;
    enrollmentTrend: EnrollmentTrend;
    feeTrend: FeeTrend;
    features: string[];
};

const ranges = [
    { label: '6M', months: 6 },
    { label: '3M', months: 3 },
    { label: '1Y', months: 12 },
] as const;

export default function ChartsSection({
    todayAttendance,
    enrollmentTrend,
    feeTrend,
    features,
}: Props) {
    const { t, formatCurrency } = useLocale();
    const [range, setRange] = useState(6);

    const filteredEnrollment = enrollmentTrend.slice(-range);
    const filteredFee = feeTrend.slice(-range);

    const hasAttendance = todayAttendance.present + todayAttendance.absent + todayAttendance.late > 0;
    const hasEnrollment = filteredEnrollment.some((d) => d.enrollments > 0);
    const hasFee = filteredFee.some((d) => d.collected > 0);

    const showAttendance = features.includes('attendance');
    const showFees = features.includes('fees');
    const showStudents = features.includes('students');

    const totalAttendance = todayAttendance.present + todayAttendance.absent + todayAttendance.late;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">{t('dashboard.charts') ?? 'Analytics'}</h2>
                <div className="flex gap-1">
                    {ranges.map((r) => (
                        <Button
                            key={r.months}
                            variant={range === r.months ? 'default' : 'ghost'}
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setRange(r.months)}
                        >
                            {r.label}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {showAttendance && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.1 }}
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="text-sm">{t('dashboard.today_attendance')}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center">
                                {hasAttendance ? (
                                    <div className="h-[200px] w-full">
                                        <Doughnut
                                            data={{
                                                labels: [
                                                    t('attendance.present'),
                                                    t('attendance.absent'),
                                                    t('attendance.late'),
                                                ],
                                                datasets: [
                                                    {
                                                        data: [
                                                            todayAttendance.present,
                                                            todayAttendance.absent,
                                                            todayAttendance.late,
                                                        ],
                                                        backgroundColor: ['#16a34a', '#dc2626', '#eab308'],
                                                        borderWidth: 0,
                                                    },
                                                ],
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                cutout: '65%',
                                                plugins: {
                                                    legend: {
                                                        position: 'bottom',
                                                        labels: { boxWidth: 10, padding: 8, font: { size: 11 } },
                                                    },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: (ctx) => {
                                                                const pct = totalAttendance > 0
                                                                    ? Math.round((ctx.parsed / totalAttendance) * 100)
                                                                    : 0;

                                                                return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
                                                            },
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-[200px] w-full flex-col items-center justify-center text-center">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                                            <BarChart3 className="size-5 text-muted-foreground" />
                                        </div>
                                        <p className="mt-2 text-sm font-medium">{t('dashboard.no_attendance_today') ?? 'No attendance recorded today'}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">{t('dashboard.mark_attendance_desc') ?? 'Mark attendance to see analytics'}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {showStudents && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.2 }}
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="text-sm">{t('dashboard.enrollment_trend')}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center">
                                {hasEnrollment ? (
                                    <div className="h-[200px] w-full">
                                        <Bar
                                            data={{
                                                labels: filteredEnrollment.map((d) => d.month),
                                                datasets: [
                                                    {
                                                        label: t('dashboard.enrollments'),
                                                        data: filteredEnrollment.map((d) => d.enrollments),
                                                        backgroundColor: '#2563eb',
                                                        borderRadius: 4,
                                                    },
                                                ],
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: { legend: { display: false } },
                                                scales: {
                                                    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                                                    y: { grid: { color: '#e5e7eb' }, ticks: { font: { size: 10 } }, beginAtZero: true },
                                                },
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-[200px] w-full flex-col items-center justify-center text-center">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                                            <BarChart3 className="size-5 text-muted-foreground" />
                                        </div>
                                        <p className="mt-2 text-sm font-medium">{t('dashboard.no_enrollments') ?? 'No enrollment data'}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">{t('dashboard.no_enrollments_desc') ?? 'Enrollment trends will appear here'}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {showFees && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.3 }}
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="text-sm">{t('dashboard.fee_collection')}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center">
                                {hasFee ? (
                                    <div className="h-[200px] w-full">
                                        <Line
                                            data={{
                                                labels: filteredFee.map((d) => d.month),
                                                datasets: [
                                                    {
                                                        label: t('dashboard.collected'),
                                                        data: filteredFee.map((d) => d.collected),
                                                        borderColor: '#16a34a',
                                                        backgroundColor: 'rgba(22, 163, 74, 0.1)',
                                                        fill: true,
                                                        tension: 0.3,
                                                        pointRadius: 0,
                                                    },
                                                ],
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: { legend: { display: false } },
                                                scales: {
                                                    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                                                    y: {
                                                        grid: { color: '#e5e7eb' },
                                                        ticks: {
                                                            font: { size: 10 },
                                                            callback: (value) => formatCurrency(Number(value)),
                                                        },
                                                        beginAtZero: true,
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-[200px] w-full flex-col items-center justify-center text-center">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                                            <BarChart3 className="size-5 text-muted-foreground" />
                                        </div>
                                        <p className="mt-2 text-sm font-medium">{t('dashboard.no_fees') ?? 'No fee data'}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">{t('dashboard.no_fees_desc') ?? 'Fee collection trends will appear here'}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
