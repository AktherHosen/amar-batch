import { Head, Link, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, GraduationCap, Layers, DollarSign, CheckCircle } from 'lucide-react';
import { useLocale } from '@/contexts/locale-context';
import { dashboard } from '@/routes';
import students from '@/routes/students';
import batches from '@/routes/batches';
import fees from '@/routes/fees';
import attendance from '@/routes/attendance';

type Stats = {
    total_students: number;
    total_teachers: number;
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

type PageProps = {
    stats: Stats;
    feeStats: FeeStats;
    recentEnrollments: Enrollment[];
    recentFeePayments: FeePayment[];
    todayAttendance: AttendanceStat;
    recentStudents: RecentStudent[];
};

const MONTH_NAMES = [
    '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function Dashboard({ stats, feeStats, recentEnrollments, recentFeePayments, todayAttendance, recentStudents }: PageProps) {
    const { t } = useLocale();
    
    return (
        <>
            <Head title={t('dashboard.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading title={t('dashboard.title')} description={t('app.tagline')} />

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard.total_students')}</CardTitle>
                            <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_students}</div>
                            <Link href={students.index().url} className="text-xs text-muted-foreground hover:underline">
                                {t('actions.view_all')}
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('nav.teachers')}</CardTitle>
                            <GraduationCap className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_teachers}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard.active_batches')}</CardTitle>
                            <Layers className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_batches}</div>
                            <Link href={batches.index().url} className="text-xs text-muted-foreground hover:underline">
                                {t('actions.view_all')}
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard.total_collected')}</CardTitle>
                            <DollarSign className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Number(feeStats.total_collected).toFixed(0)}</div>
                            <p className="text-xs text-muted-foreground">{feeStats.total_records} payment records</p>
                            <Link href={fees.index().url} className="text-xs text-muted-foreground hover:underline mt-2 block">
                                {t('actions.view_all')}
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('attendance.title')}</CardTitle>
                            <CheckCircle className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{todayAttendance.present}</div>
                                    <div className="text-xs text-muted-foreground">{t('attendance.present')}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{todayAttendance.absent}</div>
                                    <div className="text-xs text-muted-foreground">{t('attendance.absent')}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{todayAttendance.late}</div>
                                    <div className="text-xs text-muted-foreground">{t('attendance.late')}</div>
                                </div>
                            </div>
                            <Link href={attendance.index().url} className="text-xs text-muted-foreground hover:underline mt-2 block">
                                {t('actions.view_all')}
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('nav.fees')}</CardTitle>
                            <DollarSign className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{feeStats.total_records}</div>
                            <p className="text-xs text-muted-foreground">Monthly payments tracked</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('dashboard.recent_students')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentStudents.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('students.name')}</TableHead>
                                            <TableHead>{t('students.class')}</TableHead>
                                            <TableHead>{t('students.status')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentStudents.map((student) => (
                                            <TableRow key={student.id}>
                                                <TableCell className="font-medium">{student.name}</TableCell>
                                                <TableCell>{student.coaching_class?.name || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={student.status === 'active' ? 'default' : 'warning'}>
                                                        {student.status === 'active' ? t('students.active') : t('students.inactive')}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground">No students yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('dashboard.recent_payments')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentFeePayments.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('fees.student')}</TableHead>
                                            <TableHead>{t('fees.month')}</TableHead>
                                            <TableHead>{t('fees.amount_paid')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentFeePayments.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell className="font-medium">{payment.student.name}</TableCell>
                                                <TableCell>{MONTH_NAMES[payment.month]} {payment.year}</TableCell>
                                                <TableCell>{Number(payment.amount_paid).toFixed(0)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground">No recent payments.</p>
                            )}
                        </CardContent>
                    </Card>
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
