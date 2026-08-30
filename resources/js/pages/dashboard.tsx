import { Head, Link, usePage } from '@inertiajs/react';
import {
    ChevronRight,
    GraduationCap,
    Layers,
    UserPlus,
    Users,
    Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';
import { useHasFeature } from '@/lib/features';
import { isOwner, isStaff } from '@/lib/role';
import { dashboard } from '@/routes';
import batches from '@/routes/batches';
import fees from '@/routes/fees';
import students from '@/routes/students';
import users from '@/routes/users';
import ActivityFeed from './dashboard/activity-feed';
import CapacityAlert from './dashboard/capacity-alert';
import ChartsSection from './dashboard/charts-section';
import DashboardEmptyState from './dashboard/empty-state';
import GreetingBanner from './dashboard/greeting-banner';
import HolidaysWidget from './dashboard/holidays-widget';
import NoticesWidget from './dashboard/notices-widget';
import PendingApprovals from './dashboard/pending-approvals';
import QuickActions from './dashboard/quick-actions';
import StatCards from './dashboard/stat-cards';
import UpgradePrompt from './dashboard/upgrade-prompt';

type Stats = {
    total_students: number;
    total_teachers: number | null;
    active_batches: number;
    total_enrollments: number;
};

type StatsTrend = {
    total_students?: { percent: number; direction: 'up' | 'down' | 'neutral' } | null;
    total_teachers?: { percent: number; direction: 'up' | 'down' | 'neutral' } | null;
    active_batches?: { percent: number; direction: 'up' | 'down' | 'neutral' } | null;
    total_enrollments?: { percent: number; direction: 'up' | 'down' | 'neutral' } | null;
};

type FeeStats = {
    total_collected: number;
    total_records: number;
};

type MonthlyRevenue = {
    current: number;
    previous: number;
    trend: { percent: number; direction: 'up' | 'down' | 'neutral' };
};

type AttendanceStat = {
    present: number;
    absent: number;
    late: number;
};

type FeePayment = {
    id: number;
    student: { name: string };
    batch: { name: string };
    amount_paid: number;
    month: number;
    year: number;
};

type RecentStudent = {
    id: number;
    name: string;
    coaching_class: { id: number; name: string } | null;
    status: string;
    created_at: string;
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

type LowCapacityBatch = {
    id: number;
    name: string;
    capacity: number;
    enrollments_count: number;
    percentage: number;
};

type ActivityItem = {
    type: 'student' | 'enrollment' | 'fee';
    title: string;
    subtitle: string;
    date: string;
    url: string;
};

type PageProps = {
    isPendingApproval?: boolean;
    pendingTeacher?: { name: string; email: string };
    planFeatures?: string[];
    stats: Stats;
    statsTrend?: StatsTrend;
    feeStats: FeeStats;
    monthlyRevenue?: MonthlyRevenue;
    pendingApprovals?: number;
    lowCapacityBatches?: LowCapacityBatch[];
    recentFeePayments: FeePayment[];
    todayAttendance: AttendanceStat;
    recentStudents: RecentStudent[];
    activeNotices?: ActiveNotice[];
    upcomingHolidays?: UpcomingHoliday[];
    assignedBatches?: AssignedBatch[];
    batchHistory?: { completed: number; active: number };
    attendanceTrend?: { month: string; present: number; absent: number; late: number }[];
    enrollmentTrend?: { month: string; enrollments: number }[];
    feeTrend?: { month: string; collected: number }[];
    recentActivity?: ActivityItem[];
};

function getMonthName(monthIndex: number, t: (key: string) => string) {
    const months = [
        '', 'month.january', 'month.february', 'month.march', 'month.april',
        'month.may', 'month.june', 'month.july', 'month.august',
        'month.september', 'month.october', 'month.november', 'month.december',
    ];

    return t(months[monthIndex]);
}

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) {
        return 'just now';
    }

    if (seconds < 3600) {
        return `${Math.floor(seconds / 60)}m ago`;
    }

    if (seconds < 86400) {
        return `${Math.floor(seconds / 3600)}h ago`;
    }

    if (seconds < 604800) {
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export default function Dashboard({
    isPendingApproval,
    pendingTeacher,
    planFeatures = [],
    stats,
    statsTrend = {},
    feeStats,
    monthlyRevenue,
    pendingApprovals = 0,
    lowCapacityBatches = [],
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
    recentActivity = [],
}: PageProps) {
    const { t } = useLocale();
    const { auth, tenant } = usePage().props;
    const isAdmin = isOwner(auth.user);
    const isTeacher = isStaff(auth.user);

    const hasFees = useHasFeature('fees');
    const hasNotifications = useHasFeature('notifications');

    const isTrial = tenant?.subscription?.status === 'trial';

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

    const getMonthNameFn = (idx: number) => getMonthName(idx, t);

    return (
        <>
            <Head title={t('dashboard.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden p-3 pb-20 sm:rounded-xl sm:p-4 sm:pb-4">
                <GreetingBanner
                    userName={isTeacher ? auth.user?.name : tenant?.name}
                    subtitle={
                        isTeacher
                            ? t('dashboard.assigned_batches_desc')
                            : tenant?.subscription?.plan
                                ? `${tenant.subscription.plan.name}${isTrial ? ' (Trial)' : ''}`
                                : t('app.tagline')
                    }
                    isTrial={isTrial}
                    trialEndsAt={tenant?.subscription?.trial_ends_at}
                />

                <StatCards
                    stats={[
                        {
                            title: t('dashboard.total_students'),
                            value: stats.total_students,
                            icon: Users,
                            href: students.index().url,
                            linkLabel: t('actions.view_all'),
                            trend: statsTrend.total_students,
                        },
                        ...(isAdmin
                            ? [{
                                title: t('nav.teachers'),
                                value: stats.total_teachers ?? 0,
                                icon: GraduationCap,
                                href: users.index().url,
                                linkLabel: t('actions.view_all'),
                                trend: statsTrend.total_teachers,
                            }]
                            : []),
                        {
                            title: t('dashboard.active_batches'),
                            value: stats.active_batches,
                            icon: Layers,
                            href: batches.index().url,
                            linkLabel: t('actions.view_all'),
                            trend: statsTrend.active_batches,
                        },
                        {
                            title: t('dashboard.total_collected'),
                            value: feeStats.total_collected,
                            icon: Wallet,
                            href: fees.index().url,
                            linkLabel: t('actions.view_all'),
                            format: 'currency' as const,
                            trend: monthlyRevenue?.trend,
                        },
                    ]}
                />

                {isAdmin && <PendingApprovals count={pendingApprovals} />}
                {isAdmin && <CapacityAlert batches={lowCapacityBatches} />}
                {hasNotifications && <NoticesWidget notices={activeNotices} />}
                <HolidaysWidget holidays={upcomingHolidays} />
                {isAdmin && <QuickActions features={planFeatures} />}

                <ChartsSection
                    todayAttendance={todayAttendance}
                    attendanceTrend={attendanceTrend}
                    enrollmentTrend={enrollmentTrend}
                    feeTrend={feeTrend}
                    features={planFeatures}
                />

                <div className="grid gap-4 md:grid-cols-3">
                    <ActivityFeed items={recentActivity} />

                    {isAdmin && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('dashboard.recent_students')}</CardTitle>
                                <Link
                                    href={students.index().url}
                                    className="text-xs text-muted-foreground hover:underline"
                                >
                                    {t('actions.view_all')}
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {recentStudents.length > 0 ? (
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {recentStudents.map((student, idx) => (
                                            <Link
                                                key={student.id}
                                                href={students.show(student.id).url}
                                                className={`flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50 sm:px-4 ${
                                                    idx !== recentStudents.length - 1 ? 'border-b border-border/40' : ''
                                                }`}
                                            >
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                                                    <UserPlus className="size-4 text-blue-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">{student.name}</p>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {student.coaching_class?.name || '-'}
                                                    </p>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-1">
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {timeAgo(student.created_at)}
                                                    </span>
                                                    <ChevronRight className="size-3 text-muted-foreground/50" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <DashboardEmptyState
                                        icon={Users}
                                        title={t('dashboard.no_students')}
                                        description={t('dashboard.no_students')}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {isAdmin && hasFees && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('dashboard.recent_payments')}</CardTitle>
                                <Link
                                    href={fees.index().url}
                                    className="text-xs text-muted-foreground hover:underline"
                                >
                                    {t('actions.view_all')}
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {recentFeePayments.length > 0 ? (
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {recentFeePayments.map((payment, idx) => (
                                            <div
                                                key={payment.id}
                                                className={`flex items-center gap-3 px-3 py-2.5 sm:px-4 ${
                                                    idx !== recentFeePayments.length - 1 ? 'border-b border-border/40' : ''
                                                }`}
                                            >
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                                                    <Wallet className="size-4 text-green-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {payment.student.name}
                                                    </p>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {getMonthNameFn(payment.month)} {payment.year}
                                                    </p>
                                                </div>
                                                <span className="shrink-0 text-sm font-medium">
                                                    {Number(payment.amount_paid).toFixed(0)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <DashboardEmptyState
                                        icon={Wallet}
                                        title={t('dashboard.no_payments')}
                                        description={t('dashboard.no_payments')}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {!hasFees && isAdmin && (
                        <UpgradePrompt
                            feature="fees"
                            title="Fee Management"
                            description="Track and manage student fee payments."
                        />
                    )}
                </div>

                {isTeacher && assignedBatches && (
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('dashboard.my_assigned_batches')}</CardTitle>
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
                                                href={batches.show(batch.id).url}
                                                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {batch.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {batch.subject || '-'}
                                                    </p>
                                                </div>
                                                <Badge variant="secondary">
                                                    {batch.enrollments_count} students
                                                </Badge>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <DashboardEmptyState
                                        icon={Layers}
                                        title={t('dashboard.no_batches')}
                                        description={t('dashboard.no_batches')}
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {batchHistory && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('dashboard.batch_history')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="max-h-[400px] overflow-y-auto space-y-2">
                                        <div className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-green-600">
                                                    {t('dashboard.completed')}
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-sm font-bold text-green-600">
                                                {batchHistory.completed}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-blue-600">
                                                    {t('dashboard.ongoing')}
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-sm font-bold text-blue-600">
                                                {batchHistory.active}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
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
