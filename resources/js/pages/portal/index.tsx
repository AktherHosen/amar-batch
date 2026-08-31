import { Head, Link } from '@inertiajs/react';
import { CalendarCheck, ChevronRight, CreditCard, FileSignature, BookOpen, AlertCircle } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLocale } from '@/contexts/locale-context';

type Exam = {
    exam_title: string;
    subject: string;
    marks_obtained: number;
    total_marks: number;
    passing_marks: number;
    date: string | null;
};

type AttendanceDay = {
    date: string;
    status: string;
};

type Child = {
    id: number;
    name: string;
    code: string;
    photo: string | null;
    coaching_class: string | null;
    active_batches: number;
    batch_names: string[];
    attendance_percent: number;
    present_count: number;
    absent_count: number;
    total_attendance: number;
    total_paid: number;
    current_month_paid: number;
    recent_exams: Exam[];
    recent_attendance: AttendanceDay[];
};

type PageProps = {
    children: Child[];
};

const statusColors: Record<string, string> = {
    present: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    absent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    late: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function PortalIndex({ children }: PageProps) {
    const { t, formatCurrency } = useLocale();

    return (
        <>
            <Head title="My Children" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading title="My Children" description="View your children's progress and updates" />

                {children.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <AlertCircle className="mb-3 size-10 text-muted-foreground" />
                            <p className="text-sm font-medium">No children linked yet</p>
                            <p className="text-xs text-muted-foreground">Contact your coaching center to link your children.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {children.map((child) => (
                            <Link key={child.id} href={`/portal/child/${child.id}`}>
                                <Card className="transition-colors hover:bg-muted/50">
                                    <CardContent className="p-0">
                                        {/* Header */}
                                        <div className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
                                            <div className="flex items-center gap-3">
                                                {child.photo ? (
                                                    <img src={child.photo} alt={child.name} className="size-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                                        {child.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="text-sm font-semibold">{child.name}</h3>
                                                    <p className="text-xs text-muted-foreground">
                                                        {child.code} {child.coaching_class && `· ${child.coaching_class}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className="size-4 text-muted-foreground" />
                                        </div>

                                        {/* Stats row */}
                                        <div className="grid grid-cols-3 border-b divide-x">
                                            <div className="px-4 py-3 text-center sm:px-6">
                                                <p className={`text-lg font-bold ${child.attendance_percent < 75 ? 'text-red-600' : child.attendance_percent < 90 ? 'text-amber-600' : 'text-green-600'}`}>
                                                    {child.attendance_percent}%
                                                </p>
                                                <p className="text-[10px] font-medium uppercase text-muted-foreground">Attendance</p>
                                            </div>
                                            <div className="px-4 py-3 text-center sm:px-6">
                                                <p className="text-lg font-bold">{child.active_batches}</p>
                                                <p className="text-[10px] font-medium uppercase text-muted-foreground">Batches</p>
                                            </div>
                                            <div className="px-4 py-3 text-center sm:px-6">
                                                <p className="text-lg font-bold">{formatCurrency(child.total_paid)}</p>
                                                <p className="text-[10px] font-medium uppercase text-muted-foreground">Total Paid</p>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="grid gap-0 sm:grid-cols-3">
                                            {/* Batches */}
                                            <div className="border-b p-4 sm:border-b-0 sm:border-r">
                                                <p className="mb-2 text-[10px] font-semibold uppercase text-muted-foreground">Active Batches</p>
                                                {child.batch_names.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {child.batch_names.map((name, i) => (
                                                            <Badge key={i} variant="secondary" className="text-[10px]">
                                                                {name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground">No active batches</p>
                                                )}
                                            </div>

                                            {/* Recent Attendance */}
                                            <div className="border-b p-4 sm:border-b-0 sm:border-r">
                                                <p className="mb-2 text-[10px] font-semibold uppercase text-muted-foreground">Recent Attendance</p>
                                                {child.recent_attendance.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {child.recent_attendance.map((day, i) => (
                                                            <span
                                                                key={i}
                                                                className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusColors[day.status] || ''}`}
                                                                title={day.date}
                                                            >
                                                                {day.status.charAt(0).toUpperCase()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground">No records yet</p>
                                                )}
                                                {child.total_attendance > 0 && (
                                                    <p className="mt-1.5 text-[10px] text-muted-foreground">
                                                        {child.present_count} present / {child.absent_count} absent
                                                    </p>
                                                )}
                                            </div>

                                            {/* Recent Exams */}
                                            <div className="p-4">
                                                <p className="mb-2 text-[10px] font-semibold uppercase text-muted-foreground">Recent Exams</p>
                                                {child.recent_exams.length > 0 ? (
                                                    <div className="space-y-1.5">
                                                        {child.recent_exams.map((exam, i) => {
                                                            const passed = exam.marks_obtained >= exam.passing_marks;
                                                            return (
                                                                <div key={i} className="flex items-center justify-between text-xs">
                                                                    <span className="truncate text-muted-foreground">{exam.exam_title}</span>
                                                                    <Badge variant={passed ? 'success' : 'destructive'} className="ml-2 shrink-0 text-[10px]">
                                                                        {exam.marks_obtained}/{exam.total_marks}
                                                                    </Badge>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground">No exams yet</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
