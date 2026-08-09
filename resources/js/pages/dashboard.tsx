import { Head, Link, usePage } from '@inertiajs/react';
import { isOwner, isStaff } from '@/lib/role';
import {
    Users,
    GraduationCap,
    Layers,
    DollarSign,
    CheckCircle,
} from 'lucide-react';
import Heading from '@/components/heading';
import Clock from '@/components/clock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useLocale } from '@/contexts/locale-context';
import { dashboard } from '@/routes';
import students from '@/routes/students';
import batches from '@/routes/batches';
import fees from '@/routes/fees';
import attendance from '@/routes/attendance';
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

type Stats = {
    total_students: number;
    total_teachers: number | null;
    active_batches: number;
    total_enrollments: number;
};

type FeeStats = {
    total_collected: number;
    total_records: number;
};

type Enrollment = {
    id: number;
    student: { name: string };
    batch: { name: string };
    enrolled_at: string;
};

type FeePayment = {
    id: number;
    student: { name: string };
    batch: { name: string };
    amount_paid: number;
    month: number;
    year: number;
};

type AttendanceStat = {
    present: number;
    absent: number;
    late: number;
};

type RecentStudent = {
    id: number;
    name: string;
    coaching_class: { id: number; name: string } | null;
    status: string;
};

type AssignedBatch = {
    id: number;
    name: string;
    subject: string | null;
    status: string;
    enrollments_count: number;
};

type PageProps = {
    isPendingApproval?: boolean;
    pendingTeacher?: { name: string; email: string };
    stats: Stats;
    feeStats: FeeStats;
    recentEnrollments: Enrollment[];
    recentFeePayments: FeePayment[];
    todayAttendance: AttendanceStat;
    recentStudents: RecentStudent[];
    assignedBatches?: AssignedBatch[];
    batchHistory?: { completed: number; active: number };
    attendanceTrend?: { month: string; present: number; absent: number; late: number }[];
    enrollmentTrend?: { month: string; enrollments: number }[];
    feeTrend?: { month: string; collected: number }[];
};

export default function Dashboard({
    isPendingApproval,
    pendingTeacher,
    stats,
    feeStats,
    recentFeePayments,
    todayAttendance,
    recentStudents,
    assignedBatches,
    batchHistory,
    attendanceTrend = [],
    enrollmentTrend = [],
    feeTrend = [],
}: PageProps) {
    const { t } = useLocale();
    const { auth, tenant } = usePage().props;
    const isAdmin = isOwner(auth.user);
    const isTeacher = isStaff(auth.user);

    const getMonthName = (monthIndex: number) => {
        const months = ['', 'month.january', 'month.february', 'month.march', 'month.april', 'month.may', 'month.june', 'month.july', 'month.august', 'month.september', 'month.october', 'month.november', 'month.december'];
        return t(months[monthIndex]);
    };

    if (isPendingApproval) {
        return (
            <>
                <Head title={t('dashboard.pending_approval')} />
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 rounded-xl p-4">
                    <Card className="w-full max-w-md text-center">
                        <CardHeader>
                            <CardTitle className="text-xl">{t('dashboard.pending_approval')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                {t('dashboard.welcome')}, <strong>{pendingTeacher?.name}</strong>! {t('dashboard.pending_message')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {t('dashboard.pending_submessage')}
                            </p>
                            <div className="rounded-lg border bg-muted/50 p-4">
                                <p className="text-sm text-muted-foreground">
                                    <strong>{t('dashboard.email')}:</strong> {pendingTeacher?.email}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={t('dashboard.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title={
                            isTeacher
                                ? `${t('dashboard.welcome')}, ${auth.user?.name}`
                                : tenant?.name || t('dashboard.title')
                        }
                        description={
                            isTeacher
                                ? t('dashboard.assigned_batches_desc')
                                : tenant?.subscription?.plan
                                    ? `Plan: ${tenant.subscription.plan.name}${tenant.subscription.status === 'trial' ? ' (Trial)' : ''}`
                                    : t('app.tagline')
                        }
                    />
                    <Clock />
                </div>

                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">
                                {t('dashboard.total_students')}
                            </CardTitle>
                            <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">
                                {stats.total_students}
                            </div>
                            <Link
                                href={students.index().url}
                                className="text-xs text-muted-foreground hover:underline"
                            >
                                {t('actions.view_all')}
                            </Link>
                        </CardContent>
                    </Card>

                    {isAdmin && (
                        <Card className="py-3">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                                <CardTitle className="text-sm font-medium">
                                    {t('nav.teachers')}
                                </CardTitle>
                                <GraduationCap className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="px-3 pb-2 pt-0">
                                <div className="text-2xl font-bold">
                                    {stats.total_teachers ?? '-'}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">
                                {t('dashboard.active_batches')}
                            </CardTitle>
                            <Layers className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">
                                {stats.active_batches}
                            </div>
                            <Link
                                href={batches.index().url}
                                className="text-xs text-muted-foreground hover:underline"
                            >
                                {t('actions.view_all')}
                            </Link>
                        </CardContent>
                    </Card>

                    {isAdmin && (
                        <Card className="py-3">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                                <CardTitle className="text-sm font-medium">
                                    {t('dashboard.total_collected')}
                                </CardTitle>
                                <DollarSign className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="px-3 pb-2 pt-0">
                                <div className="text-2xl font-bold">
                                    {Number(feeStats.total_collected).toFixed(
                                        0,
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {feeStats.total_records} {t('dashboard.payment_records')}
                                </p>
                                <Link
                                    href={fees.index().url}
                                    className="mt-1 block text-xs text-muted-foreground hover:underline"
                                >
                                    {t('actions.view_all')}
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    {isTeacher && (
                        <Card className="py-3">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                                <CardTitle className="text-sm font-medium">
                                    {t('dashboard.total_collected')}
                                </CardTitle>
                                <DollarSign className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="px-3 pb-2 pt-0">
                                <div className="text-2xl font-bold">
                                    {Number(feeStats.total_collected).toFixed(
                                        0,
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {feeStats.total_records} {t('dashboard.payment_records')}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard.today_attendance')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px]">
                                <Doughnut
                                    data={{
                                        labels: [t('attendance.present'), t('attendance.absent'), t('attendance.late')],
                                        datasets: [{
                                            data: [todayAttendance.present, todayAttendance.absent, todayAttendance.late],
                                            backgroundColor: ['#16a34a', '#dc2626', '#eab308'],
                                            borderWidth: 0,
                                        }],
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        cutout: '60%',
                                        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } } },
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard.enrollment_trend')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px]">
                                <Bar
                                    data={{
                                        labels: enrollmentTrend.map(d => d.month),
                                        datasets: [{
                                            label: t('dashboard.enrollments'),
                                            data: enrollmentTrend.map(d => d.enrollments),
                                            backgroundColor: '#2563eb',
                                            borderRadius: 4,
                                        }],
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
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard.fee_collection')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px]">
                                <Line
                                    data={{
                                        labels: feeTrend.map(d => d.month),
                                        datasets: [{
                                            label: t('dashboard.collected'),
                                            data: feeTrend.map(d => d.collected),
                                            borderColor: '#16a34a',
                                            backgroundColor: 'rgba(22, 163, 74, 0.1)',
                                            fill: true,
                                            tension: 0.3,
                                            pointRadius: 0,
                                        }],
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
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('attendance.title')}
                            </CardTitle>
                            <CheckCircle className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {todayAttendance.present}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {t('attendance.present')}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                        {todayAttendance.absent}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {t('attendance.absent')}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {todayAttendance.late}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {t('attendance.late')}
                                    </div>
                                </div>
                            </div>
                            <Link
                                href={attendance.index().url}
                                className="mt-2 block text-xs text-muted-foreground hover:underline"
                            >
                                {t('actions.view_all')}
                            </Link>
                        </CardContent>
                    </Card>

                    {isAdmin && (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t('dashboard.recent_students')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentStudents.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    {t('students.name')}
                                                </TableHead>
                                                <TableHead>
                                                    {t('students.class')}
                                                </TableHead>
                                                <TableHead>
                                                    {t('students.status')}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentStudents.map((student) => (
                                                <TableRow key={student.id}>
                                                    <TableCell className="font-medium">
                                                        {student.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {student.coaching_class
                                                            ?.name || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                student.status ===
                                                                'active'
                                                                    ? 'default'
                                                                    : 'warning'
                                                            }
                                                        >
                                                            {student.status ===
                                                            'active'
                                                                ? t(
                                                                      'students.active',
                                                                  )
                                                                : t(
                                                                      'students.inactive',
                                                                  )}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        {t('dashboard.no_students')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {isTeacher && assignedBatches && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('dashboard.my_assigned_batches')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {assignedBatches.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    {t('batches.name')}
                                                </TableHead>
                                                <TableHead>
                                                    {t('batches.subject')}
                                                </TableHead>
                                                <TableHead>{t('dashboard.students')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {assignedBatches.map((batch) => (
                                                <TableRow key={batch.id}>
                                                    <TableCell className="font-medium">
                                                        {batch.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {batch.subject || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {
                                                            batch.enrollments_count
                                                        }
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        {t('dashboard.no_batches')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {batchHistory && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('dashboard.batch_history')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-lg border p-4">
                                        <div className="text-2xl font-bold text-green-600">
                                            {batchHistory.completed}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {t('dashboard.completed')}
                                        </div>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {batchHistory.active}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {t('dashboard.ongoing')}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {isAdmin && (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t('dashboard.recent_payments')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentFeePayments.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    {t('fees.student')}
                                                </TableHead>
                                                <TableHead>
                                                    {t('fees.month')}
                                                </TableHead>
                                                <TableHead>
                                                    {t('fees.amount_paid')}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentFeePayments.map(
                                                (payment) => (
                                                    <TableRow key={payment.id}>
                                                        <TableCell className="font-medium">
                                                            {
                                                                payment.student
                                                                    .name
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {
                                                                getMonthName(
                                                                    payment
                                                                        .month
                                                                )
                                                            }{' '}
                                                            {payment.year}
                                                        </TableCell>
                                                        <TableCell>
                                                            {Number(
                                                                payment.amount_paid,
                                                            ).toFixed(0)}
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        {t('dashboard.no_payments')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {isTeacher && (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t('dashboard.recent_students')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentStudents.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    {t('students.name')}
                                                </TableHead>
                                                <TableHead>
                                                    {t('students.class')}
                                                </TableHead>
                                                <TableHead>
                                                    {t('students.status')}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentStudents.map((student) => (
                                                <TableRow key={student.id}>
                                                    <TableCell className="font-medium">
                                                        {student.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {student.coaching_class
                                                            ?.name || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                student.status ===
                                                                'active'
                                                                    ? 'default'
                                                                    : 'warning'
                                                            }
                                                        >
                                                            {student.status ===
                                                            'active'
                                                                ? t(
                                                                      'students.active',
                                                                  )
                                                                : t(
                                                                      'students.inactive',
                                                                  )}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        {t('dashboard.no_students_in_batches')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
