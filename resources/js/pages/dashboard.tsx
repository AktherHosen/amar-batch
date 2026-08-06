import { Head, Link, usePage } from '@inertiajs/react';
import {
    Users,
    GraduationCap,
    Layers,
    DollarSign,
    CheckCircle,
} from 'lucide-react';
import Heading from '@/components/heading';
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
    stats: Stats;
    feeStats: FeeStats;
    recentEnrollments: Enrollment[];
    recentFeePayments: FeePayment[];
    todayAttendance: AttendanceStat;
    recentStudents: RecentStudent[];
    assignedBatches?: AssignedBatch[];
    batchHistory?: { completed: number; active: number };
};

const MONTH_NAMES = [
    '',
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

export default function Dashboard({
    stats,
    feeStats,
    recentFeePayments,
    todayAttendance,
    recentStudents,
    assignedBatches,
    batchHistory,
}: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage().props;
    const isAdmin = auth.user?.role === 'admin';
    const isTeacher = auth.user?.role === 'teacher';

    return (
        <>
            <Head title={t('dashboard.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    title={
                        isTeacher
                            ? `Welcome, ${auth.user?.name}`
                            : t('dashboard.title')
                    }
                    description={
                        isTeacher
                            ? 'Your assigned batches and students'
                            : t('app.tagline')
                    }
                />

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
                                    {feeStats.total_records} payment records
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
                                    {feeStats.total_records} payment records
                                </p>
                            </CardContent>
                        </Card>
                    )}
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
                                        No students yet.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {isTeacher && assignedBatches && (
                        <Card>
                            <CardHeader>
                                <CardTitle>My Assigned Batches</CardTitle>
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
                                                <TableHead>Students</TableHead>
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
                                        No batches assigned yet. Contact admin.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {batchHistory && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Batch History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-lg border p-4">
                                        <div className="text-2xl font-bold text-green-600">
                                            {batchHistory.completed}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Completed
                                        </div>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {batchHistory.active}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Ongoing
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
                                                                MONTH_NAMES[
                                                                    payment
                                                                        .month
                                                                ]
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
                                        No recent payments.
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
                                        No students in your batches yet.
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
