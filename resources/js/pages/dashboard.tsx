import { Head, Link, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, GraduationCap, Layers, DollarSign, CheckCircle } from 'lucide-react';
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
    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading title="Dashboard" description="Overview of your coaching center" />

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_students}</div>
                            <Link href={students.index().url} className="text-xs text-muted-foreground hover:underline">
                                View all
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                            <GraduationCap className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_teachers}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
                            <Layers className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_batches}</div>
                            <Link href={batches.index().url} className="text-xs text-muted-foreground hover:underline">
                                View all
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Enrollments</CardTitle>
                            <CheckCircle className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_enrollments}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Fee Collected</CardTitle>
                            <DollarSign className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Number(feeStats.total_collected).toFixed(0)}</div>
                            <p className="text-xs text-muted-foreground">{feeStats.total_records} payment records</p>
                            <Link href={fees.index().url} className="text-xs text-muted-foreground hover:underline mt-2 block">
                                View all
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
                            <CheckCircle className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{todayAttendance.present}</div>
                                    <div className="text-xs text-muted-foreground">Present</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{todayAttendance.absent}</div>
                                    <div className="text-xs text-muted-foreground">Absent</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{todayAttendance.late}</div>
                                    <div className="text-xs text-muted-foreground">Late</div>
                                </div>
                            </div>
                            <Link href={attendance.index().url} className="text-xs text-muted-foreground hover:underline mt-2 block">
                                View all
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Fee Records</CardTitle>
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
                            <CardTitle>Recent Enrollments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentEnrollments.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Batch</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentEnrollments.map((enrollment) => (
                                            <TableRow key={enrollment.id}>
                                                <TableCell className="font-medium">{enrollment.student.name}</TableCell>
                                                <TableCell>{enrollment.batch.name}</TableCell>
                                                <TableCell>{new Date(enrollment.enrolled_at).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground">No recent enrollments.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Fee Payments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentFeePayments.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Month</TableHead>
                                            <TableHead>Amount</TableHead>
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

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentStudents.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Class</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">{student.name}</TableCell>
                                            <TableCell>{student.coaching_class?.name || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                                                    {student.status}
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
