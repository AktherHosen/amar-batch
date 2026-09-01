import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, CalendarCheck, CreditCard, FileSignature, User } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLocale } from '@/contexts/locale-context';

type Student = {
    id: number;
    name: string;
    code: string;
    phone: string | null;
    photo: string | null;
    coaching_class: string | null;
    guardian_name: string | null;
    guardian_phone: string | null;
    date_of_birth: string | null;
    joined_at: string;
    enrollments: {
        id: number;
        batch: { id: number; name: string };
        status: string;
        enrolled_at: string;
    }[];
};

type AttendanceSummary = Record<number, Record<number, Record<string, number>>>;

type FeeStatus = {
    id: number;
    batch: { id: number; name: string };
    month: number;
    year: number;
    amount_paid: number;
    amount_due: number;
    notes: string | null;
};

type ExamResult = {
    id: number;
    exam: {
        id: number;
        title: string;
        subject: string;
        exam_date: string;
        total_marks: number;
        passing_marks: number;
        batch: { id: number; name: string };
    };
    marks_obtained: number;
    notes: string | null;
};

type PageProps = {
    student: Student;
    attendanceSummary: AttendanceSummary;
    feeStatuses: FeeStatus[];
    examResults: ExamResult[];
    totalPaid: number;
    totalDues: number;
    attendancePercent: number;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function PortalShow({ student, attendanceSummary, feeStatuses, examResults, totalPaid, totalDues, attendancePercent }: PageProps) {
    const { t, formatCurrency } = useLocale();

    const years = Object.keys(attendanceSummary)
        .map(Number)
        .sort((a, b) => b - a);

    const latestYear = years[0] || new Date().getFullYear();
    const yearData = attendanceSummary[latestYear] || {};

    let yearPresent = 0;
    let yearAbsent = 0;
    let yearLate = 0;
    for (const monthData of Object.values(yearData)) {
        yearPresent += monthData['present'] ?? 0;
        yearAbsent += monthData['absent'] ?? 0;
        yearLate += monthData['late'] ?? 0;
    }
    const yearTotal = yearPresent + yearAbsent + yearLate;

    return (
        <>
            <Head title={student.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <Link href="/portal" className="flex size-8 items-center justify-center rounded-md border bg-background hover:bg-accent">
                        <ArrowLeft className="size-4" />
                    </Link>
                    <Heading title={student.name} description={`Code: ${student.code}`} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <CalendarCheck className="size-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Attendance</p>
                                <p className="text-2xl font-bold">{attendancePercent}%</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                                <CreditCard className="size-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Paid</p>
                                <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                                <CreditCard className="size-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Dues</p>
                                <p className={`text-2xl font-bold ${totalDues > 0 ? 'text-red-600' : ''}`}>{formatCurrency(totalDues)}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                                <BookOpen className="size-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Active Batches</p>
                                <p className="text-2xl font-bold">{student.enrollments.filter((e) => e.status === 'active').length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                                <FileSignature className="size-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Exams Taken</p>
                                <p className="text-2xl font-bold">{examResults.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <User className="size-4 text-muted-foreground" />
                                Student Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Class</span>
                                <span className="font-medium">{student.coaching_class || '—'}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Phone</span>
                                <span className="font-medium">{student.phone || '—'}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Guardian</span>
                                <span className="font-medium">{student.guardian_name || '—'}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Guardian Phone</span>
                                <span className="font-medium">{student.guardian_phone || '—'}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Joined</span>
                                <span className="font-medium">{new Date(student.joined_at).toLocaleDateString()}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CalendarCheck className="size-4 text-muted-foreground" />
                                Attendance — {latestYear}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {yearTotal > 0 ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                                            <div
                                                className="h-full rounded-full bg-primary transition-all"
                                                style={{ width: `${attendancePercent}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-semibold">{attendancePercent}%</span>
                                    </div>
                                    <div className="flex gap-4 text-xs">
                                        <span className="flex items-center gap-1">
                                            <span className="size-2 rounded-full bg-green-500" /> Present: {yearPresent}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="size-2 rounded-full bg-red-500" /> Absent: {yearAbsent}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="size-2 rounded-full bg-amber-500" /> Late: {yearLate}
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="whitespace-nowrap">Month</TableHead>
                                                    <TableHead className="whitespace-nowrap">Present</TableHead>
                                                    <TableHead className="whitespace-nowrap">Absent</TableHead>
                                                    <TableHead className="whitespace-nowrap">Late</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {Object.entries(yearData)
                                                    .sort(([a], [b]) => Number(a) - Number(b))
                                                    .map(([month, data]) => (
                                                        <TableRow key={month}>
                                                            <TableCell className="whitespace-nowrap font-medium">
                                                                {MONTHS[Number(month) - 1]}
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap">{data['present'] ?? 0}</TableCell>
                                                            <TableCell className="whitespace-nowrap">{data['absent'] ?? 0}</TableCell>
                                                            <TableCell className="whitespace-nowrap">{data['late'] ?? 0}</TableCell>
                                                        </TableRow>
                                                    ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            ) : (
                                <p className="py-4 text-center text-sm text-muted-foreground">No attendance data for {latestYear}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CreditCard className="size-4 text-muted-foreground" />
                                Fee Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {feeStatuses.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="whitespace-nowrap">Batch</TableHead>
                                                <TableHead className="whitespace-nowrap">Month</TableHead>
                                                <TableHead className="whitespace-nowrap">Year</TableHead>
                                                <TableHead className="whitespace-nowrap">Due</TableHead>
                                                <TableHead className="whitespace-nowrap">Paid</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {feeStatuses.slice(0, 20).map((fee) => {
                                                const due = Number(fee.amount_due) || 0;
                                                const paid = Number(fee.amount_paid) || 0;
                                                const isPartial = due > 0 && paid > 0 && paid < due;
                                                return (
                                                    <TableRow key={fee.id}>
                                                        <TableCell className="whitespace-nowrap font-medium">{fee.batch.name}</TableCell>
                                                        <TableCell className="whitespace-nowrap">{MONTHS[fee.month - 1]}</TableCell>
                                                        <TableCell className="whitespace-nowrap">{fee.year}</TableCell>
                                                        <TableCell className="whitespace-nowrap">{formatCurrency(due)}</TableCell>
                                                        <TableCell className="whitespace-nowrap">
                                                            <span className={isPartial ? 'text-amber-600' : ''}>
                                                                {formatCurrency(paid)}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <p className="py-4 text-center text-sm text-muted-foreground">No fee records found</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileSignature className="size-4 text-muted-foreground" />
                                Exam Results
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {examResults.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="whitespace-nowrap">Exam</TableHead>
                                                <TableHead className="whitespace-nowrap">Subject</TableHead>
                                                <TableHead className="whitespace-nowrap">Batch</TableHead>
                                                <TableHead className="whitespace-nowrap">Marks</TableHead>
                                                <TableHead className="whitespace-nowrap">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {examResults.slice(0, 20).map((result) => {
                                                const passed = result.marks_obtained >= result.exam.passing_marks;
                                                return (
                                                    <TableRow key={result.id}>
                                                        <TableCell className="whitespace-nowrap font-medium">{result.exam.title}</TableCell>
                                                        <TableCell className="whitespace-nowrap">{result.exam.subject}</TableCell>
                                                        <TableCell className="whitespace-nowrap">{result.exam.batch.name}</TableCell>
                                                        <TableCell className="whitespace-nowrap">
                                                            {result.marks_obtained}/{result.exam.total_marks}
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
                                </div>
                            ) : (
                                <p className="py-4 text-center text-sm text-muted-foreground">No exam results found</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
