import Clock from '@/components/clock';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';
import { isOwner, isStaff } from '@/lib/role';
import { dashboard } from '@/routes';
import attendance from '@/routes/attendance';
import batches from '@/routes/batches';
import fees from '@/routes/fees';
import students from '@/routes/students';
import teachers from '@/routes/teachers';
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
    Title,
    Tooltip,
} from 'chart.js';
import { motion } from 'framer-motion';
import {
    Calendar,
    CheckCircle,
    ChevronRight,
    ClipboardCheck,
    CreditCard,
    Wallet,
    GraduationCap,
    Layers,
    Megaphone,
    Plus,
    Users,
} from 'lucide-react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

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

type ActiveNotice = {
    id: number;
    title: string;
    content: string;
    created_at: string;
};

type UpcomingHoliday = {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    type: string;
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
    activeNotices?: ActiveNotice[];
    upcomingHolidays?: UpcomingHoliday[];
    assignedBatches?: AssignedBatch[];
    batchHistory?: { completed: number; active: number };
    attendanceTrend?: {
        month: string;
        present: number;
        absent: number;
        late: number;
    }[];
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
    activeNotices = [],
    upcomingHolidays = [],
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
        const months = [
            '',
            'month.january',
            'month.february',
            'month.march',
            'month.april',
            'month.may',
            'month.june',
            'month.july',
            'month.august',
            'month.september',
            'month.october',
            'month.november',
            'month.december',
        ];

        return t(months[monthIndex]);
    };

    if (isPendingApproval) {
        return (
            <>
                <Head title={t('dashboard.pending_approval')} />
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-4">
                    <Card className="w-full max-w-md text-center">
                        <CardHeader>
                            <CardTitle className="text-xl">
                                {t('dashboard.pending_approval')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                {t('dashboard.welcome')},{' '}
                                <strong>{pendingTeacher?.name}</strong>!{' '}
                                {t('dashboard.pending_message')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {t('dashboard.pending_submessage')}
                            </p>
                            <div className="rounded-lg border bg-muted/50 p-4">
                                <p className="text-sm text-muted-foreground">
                                    <strong>{t('dashboard.email')}:</strong>{' '}
                                    {pendingTeacher?.email}
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

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden p-3 pb-20 sm:rounded-xl sm:p-4 sm:pb-4">
                {/* Header */}
                <motion.div
                    className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
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
                    <div className="hidden sm:block">
                        <Clock />
                    </div>
                </motion.div>

                {/* Stat Cards */}
                <motion.div
                    className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.1 } },
                    }}
                >
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: {
                                opacity: 1,
                                y: 0,
                                transition: { duration: 0.4 },
                            },
                        }}
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>
                                    {t('dashboard.total_students')}
                                </CardTitle>
                                <Users className="size-3.5 text-muted-foreground sm:size-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold sm:text-2xl">
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
                    </motion.div>

                    {isAdmin && (
                        <motion.div
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: { duration: 0.4 },
                                },
                            }}
                        >
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>
                                        {t('nav.teachers')}
                                    </CardTitle>
                                    <GraduationCap className="size-3.5 text-muted-foreground sm:size-4" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-bold sm:text-2xl">
                                        {stats.total_teachers ?? '-'}
                                    </div>
                                    <Link
                                        href={teachers.index().url}
                                        className="text-xs text-muted-foreground hover:underline"
                                    >
                                        {t('actions.view_all')}
                                    </Link>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: {
                                opacity: 1,
                                y: 0,
                                transition: { duration: 0.4 },
                            },
                        }}
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>
                                    {t('dashboard.active_batches')}
                                </CardTitle>
                                <Layers className="size-3.5 text-muted-foreground sm:size-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold sm:text-2xl">
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
                    </motion.div>

                    {isAdmin && (
                        <motion.div
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: { duration: 0.4 },
                                },
                            }}
                        >
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>
                                        {t('dashboard.total_collected')}
                                    </CardTitle>
                                    <Wallet className="size-3.5 text-muted-foreground sm:size-4" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-bold sm:text-2xl">
                                        {Number(
                                            feeStats.total_collected,
                                        ).toFixed(0)}
                                    </div>
                                    <Link
                                        href={fees.index().url}
                                        className="text-xs text-muted-foreground hover:underline"
                                    >
                                        {t('actions.view_all')}
                                    </Link>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {isTeacher && (
                        <motion.div
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: { duration: 0.4 },
                                },
                            }}
                        >
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>
                                        {t('dashboard.total_collected')}
                                    </CardTitle>
                                    <Wallet className="size-3.5 text-muted-foreground sm:size-4" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-bold sm:text-2xl">
                                        {Number(
                                            feeStats.total_collected,
                                        ).toFixed(0)}
                                    </div>
                                    <Link
                                        href={fees.index().url}
                                        className="text-xs text-muted-foreground hover:underline"
                                    >
                                        {t('actions.view_all')}
                                    </Link>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </motion.div>

                {/* Active Notices */}
                {activeNotices.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10">
                                        <Megaphone className="size-3.5 text-amber-600" />
                                    </div>
                                    <CardTitle>
                                        {t('dashboard.recent_notices')}
                                    </CardTitle>
                                </div>
                                <Link
                                    href="/notices"
                                    className="text-xs text-muted-foreground hover:underline"
                                >
                                    {t('actions.view_all')}
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        hidden: {},
                                        visible: {
                                            transition: {
                                                staggerChildren: 0.06,
                                            },
                                        },
                                    }}
                                >
                                    {activeNotices.map((notice, idx) => (
                                        <motion.div
                                            key={notice.id}
                                            variants={{
                                                hidden: { opacity: 0, y: 4 },
                                                visible: { opacity: 1, y: 0 },
                                            }}
                                        >
                                            <Link
                                                href={`/notices/${notice.id}`}
                                                className={`flex items-start gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50 sm:px-4 ${idx !== activeNotices.length - 1 ? 'border-b border-border/40' : ''}`}
                                            >
                                                <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-amber-500/10">
                                                    <Megaphone className="size-3 text-amber-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-sm font-medium leading-snug">
                                                        {notice.title}
                                                    </h4>
                                                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                                        {notice.content}
                                                    </p>
                                                </div>
                                                <ChevronRight className="mt-1 size-3.5 shrink-0 text-muted-foreground/50" />
                                            </Link>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Upcoming Holidays */}
                {upcomingHolidays.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10">
                                        <Calendar className="size-3.5 text-blue-600" />
                                    </div>
                                    <CardTitle>
                                        {t('dashboard.upcoming_holidays')}
                                    </CardTitle>
                                </div>
                                <Link
                                    href="/holidays"
                                    className="text-xs text-muted-foreground hover:underline"
                                >
                                    {t('actions.view_all')}
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        hidden: {},
                                        visible: {
                                            transition: {
                                                staggerChildren: 0.06,
                                            },
                                        },
                                    }}
                                >
                                    {upcomingHolidays.map((holiday, idx) => {
                                        const start = new Date(holiday.start_date);
                                        const end = new Date(holiday.end_date);
                                        const day = start.getDate();
                                        const month = start.toLocaleDateString('en', { month: 'short' });
                                        const isMultiDay = start.toDateString() !== end.toDateString();

                                        return (
                                            <motion.div
                                                key={holiday.id}
                                                variants={{
                                                    hidden: { opacity: 0, y: 4 },
                                                    visible: { opacity: 1, y: 0 },
                                                }}
                                            >
                                                <Link
                                                    href={`/holidays/${holiday.id}`}
                                                    className={`flex items-start gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50 sm:px-4 ${idx !== upcomingHolidays.length - 1 ? 'border-b border-border/40' : ''}`}
                                                >
                                                    <div className="flex size-6 shrink-0 flex-col items-center justify-center rounded-md bg-blue-500/10 leading-none">
                                                        <span className="text-[10px] font-bold text-blue-600">{day}</span>
                                                        <span className="text-[8px] font-medium text-blue-600/70">{month}</span>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="text-sm font-medium leading-snug">
                                                            {holiday.title}
                                                        </h4>
                                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                                            {isMultiDay
                                                                ? `${start.toLocaleDateString('en', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                                                : start.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className={`mt-0.5 shrink-0 text-[10px] font-medium ${
                                                            holiday.type === 'holiday'
                                                                ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                                                : holiday.type === 'exam'
                                                                  ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                                  : 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                                        }`}
                                                    >
                                                        {holiday.type}
                                                    </Badge>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Quick Actions — floating bottom nav on mobile, card on desktop */}
                {isAdmin && (
                    <>
                        {/* Mobile: floating bottom nav */}
                        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 px-2 py-2 backdrop-blur-md sm:hidden">
                            <div className="flex items-center justify-around">
                                <Link href="/students/create" className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-muted-foreground transition-colors hover:text-foreground">
                                    <Plus className="size-5 shrink-0" />
                                    <span className="w-full truncate text-center text-[10px] font-medium">{t('students.title')}</span>
                                </Link>
                                <Link href="/attendance/create" className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-muted-foreground transition-colors hover:text-foreground">
                                    <ClipboardCheck className="size-5 shrink-0" />
                                    <span className="w-full truncate text-center text-[10px] font-medium">{t('attendance.title')}</span>
                                </Link>
                                <Link href="/fees" className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-muted-foreground transition-colors hover:text-foreground">
                                    <CreditCard className="size-5 shrink-0" />
                                    <span className="w-full truncate text-center text-[10px] font-medium">{t('fees.title')}</span>
                                </Link>
                                <Link href="/notices/create" className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-muted-foreground transition-colors hover:text-foreground">
                                    <Megaphone className="size-5 shrink-0" />
                                    <span className="w-full truncate text-center text-[10px] font-medium">{t('notices.title')}</span>
                                </Link>
                            </div>
                        </div>

                        {/* Desktop: card */}
                        <motion.div
                            className="hidden sm:block"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.35 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {t('dashboard.quick_actions')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <motion.div
                                        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                                        initial="hidden"
                                        animate="visible"
                                        variants={{
                                            hidden: {},
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.06,
                                                },
                                            },
                                        }}
                                    >
                                        <motion.div
                                            variants={{
                                                hidden: { opacity: 0, scale: 0.9 },
                                                visible: { opacity: 1, scale: 1 },
                                            }}
                                        >
                                            <Link href="/students/create">
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start"
                                                >
                                                    <Plus className="mr-2 size-4" />
                                                    {t('dashboard.add_student')}
                                                </Button>
                                            </Link>
                                        </motion.div>
                                        <motion.div
                                            variants={{
                                                hidden: { opacity: 0, scale: 0.9 },
                                                visible: { opacity: 1, scale: 1 },
                                            }}
                                        >
                                            <Link href="/attendance/create">
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start"
                                                >
                                                    <ClipboardCheck className="mr-2 size-4" />
                                                    {t('dashboard.mark_attendance')}
                                                </Button>
                                            </Link>
                                        </motion.div>
                                        <motion.div
                                            variants={{
                                                hidden: { opacity: 0, scale: 0.9 },
                                                visible: { opacity: 1, scale: 1 },
                                            }}
                                        >
                                            <Link href="/fees">
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start"
                                                >
                                                    <CreditCard className="mr-2 size-4" />
                                                    {t('dashboard.record_payment')}
                                                </Button>
                                            </Link>
                                        </motion.div>
                                        <motion.div
                                            variants={{
                                                hidden: { opacity: 0, scale: 0.9 },
                                                visible: { opacity: 1, scale: 1 },
                                            }}
                                        >
                                            <Link href="/notices/create">
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start"
                                                >
                                                    <Megaphone className="mr-2 size-4" />
                                                    {t('dashboard.post_notice')}
                                                </Button>
                                            </Link>
                                        </motion.div>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </>
                )}

                {/* Charts — full width on mobile, grid on desktop */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t('dashboard.today_attendance')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
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
                                                    backgroundColor: [
                                                        '#16a34a',
                                                        '#dc2626',
                                                        '#eab308',
                                                    ],
                                                    borderWidth: 0,
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            cutout: '60%',
                                            plugins: {
                                                legend: {
                                                    position: 'bottom',
                                                    labels: {
                                                        boxWidth: 12,
                                                        padding: 8,
                                                        font: { size: 11 },
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t('dashboard.enrollment_trend')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[200px] w-full">
                                    <Bar
                                        data={{
                                            labels: enrollmentTrend.map(
                                                (d) => d.month,
                                            ),
                                            datasets: [
                                                {
                                                    label: t(
                                                        'dashboard.enrollments',
                                                    ),
                                                    data: enrollmentTrend.map(
                                                        (d) => d.enrollments,
                                                    ),
                                                    backgroundColor: '#2563eb',
                                                    borderRadius: 4,
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: false },
                                            },
                                            scales: {
                                                x: {
                                                    grid: { display: false },
                                                    ticks: {
                                                        font: { size: 10 },
                                                    },
                                                },
                                                y: {
                                                    grid: { color: '#e5e7eb' },
                                                    ticks: {
                                                        font: { size: 10 },
                                                    },
                                                    beginAtZero: true,
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.6 }}
                        className="sm:col-span-2 lg:col-span-1"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t('dashboard.fee_collection')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[200px] w-full">
                                    <Line
                                        data={{
                                            labels: feeTrend.map(
                                                (d) => d.month,
                                            ),
                                            datasets: [
                                                {
                                                    label: t(
                                                        'dashboard.collected',
                                                    ),
                                                    data: feeTrend.map(
                                                        (d) => d.collected,
                                                    ),
                                                    borderColor: '#16a34a',
                                                    backgroundColor:
                                                        'rgba(22, 163, 74, 0.1)',
                                                    fill: true,
                                                    tension: 0.3,
                                                    pointRadius: 0,
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: false },
                                            },
                                            scales: {
                                                x: {
                                                    grid: { display: false },
                                                    ticks: {
                                                        font: { size: 10 },
                                                    },
                                                },
                                                y: {
                                                    grid: { color: '#e5e7eb' },
                                                    ticks: {
                                                        font: { size: 10 },
                                                    },
                                                    beginAtZero: true,
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Bottom section — single column on mobile, grid on desktop */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Attendance Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.7 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>
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
                                    className="mt-3 block text-xs text-muted-foreground hover:underline"
                                >
                                    {t('actions.view_all')}
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Batch History (teacher) */}
                    {batchHistory && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.85 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {t('dashboard.batch_history')}
                                    </CardTitle>
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
                        </motion.div>
                    )}

                    {/* Recent Students (admin) — card list on mobile */}
                    {isAdmin && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.8 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {t('dashboard.recent_students')}
                                    </CardTitle>
                                    <Link
                                        href={students.index().url}
                                        className="text-xs text-muted-foreground hover:underline"
                                    >
                                        {t('actions.view_all')}
                                    </Link>
                                </CardHeader>
                                <CardContent>
                                    {recentStudents.length > 0 ? (
                                        <div className="space-y-2">
                                            {recentStudents.map((student) => (
                                                <Link
                                                    key={student.id}
                                                    href={
                                                        students.show(
                                                            student.id,
                                                        ).url
                                                    }
                                                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium">
                                                            {student.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {student
                                                                .coaching_class
                                                                ?.name || '-'}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            student.status ===
                                                            'active'
                                                                ? 'default'
                                                                : 'secondary'
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
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            {t('dashboard.no_students')}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Assigned Batches (teacher) — card list on mobile */}
                    {isTeacher && assignedBatches && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.8 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {t('dashboard.my_assigned_batches')}
                                    </CardTitle>
                                    <Link
                                        href={batches.index().url}
                                        className="text-xs text-muted-foreground hover:underline"
                                    >
                                        {t('actions.view_all')}
                                    </Link>
                                </CardHeader>
                                <CardContent>
                                    {assignedBatches.length > 0 ? (
                                        <div className="space-y-2">
                                            {assignedBatches.map((batch) => (
                                                <Link
                                                    key={batch.id}
                                                    href={
                                                        batches.show(batch.id)
                                                            .url
                                                    }
                                                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium">
                                                            {batch.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {batch.subject ||
                                                                '-'}
                                                        </p>
                                                    </div>
                                                    <Badge variant="secondary">
                                                        {
                                                            batch.enrollments_count
                                                        }{' '}
                                                        students
                                                    </Badge>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            {t('dashboard.no_batches')}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Recent Payments (admin) — card list on mobile */}
                    {isAdmin && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.9 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {t('dashboard.recent_payments')}
                                    </CardTitle>
                                    <Link
                                        href={fees.index().url}
                                        className="text-xs text-muted-foreground hover:underline"
                                    >
                                        {t('actions.view_all')}
                                    </Link>
                                </CardHeader>
                                <CardContent>
                                    {recentFeePayments.length > 0 ? (
                                        <div className="space-y-2">
                                            {recentFeePayments.map(
                                                (payment) => (
                                                    <div
                                                        key={payment.id}
                                                        className="flex items-center justify-between rounded-lg border p-3"
                                                    >
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-medium">
                                                                {
                                                                    payment
                                                                        .student
                                                                        .name
                                                                }
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {getMonthName(
                                                                    payment.month,
                                                                )}{' '}
                                                                {payment.year}
                                                            </p>
                                                        </div>
                                                        <span className="shrink-0 text-sm font-medium">
                                                            {Number(
                                                                payment.amount_paid,
                                                            ).toFixed(0)}
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            {t('dashboard.no_payments')}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Recent Students (teacher) — card list */}
                    {isTeacher && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.8 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {t('dashboard.recent_students')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {recentStudents.length > 0 ? (
                                        <div className="space-y-2">
                                            {recentStudents.map((student) => (
                                                <div
                                                    key={student.id}
                                                    className="flex items-center justify-between rounded-lg border p-3"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium">
                                                            {student.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {student
                                                                .coaching_class
                                                                ?.name || '-'}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            student.status ===
                                                            'active'
                                                                ? 'default'
                                                                : 'secondary'
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
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            {t(
                                                'dashboard.no_students_in_batches',
                                            )}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
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
