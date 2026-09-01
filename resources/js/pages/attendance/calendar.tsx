import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/contexts/locale-context';
import { useMemo, useCallback } from 'react';
import attendance from '@/routes/attendance';

type Student = { id: number; name: string };
type CalendarData = Record<string, Record<number, string>>;
type Summary = { total_records: number; present: number; absent: number; late: number };

type Props = {
    batches: { id: number; name: string }[];
    students: Student[];
    calendarData: CalendarData;
    summary: Summary;
    batchId: number | null;
    month: string;
};

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month - 1, 1).getDay();
}

const STATUS_COLORS: Record<string, string> = {
    present: 'bg-green-500',
    absent: 'bg-red-500',
    late: 'bg-yellow-500',
};

const STATUS_TEXT_COLORS: Record<string, string> = {
    present: 'text-green-700 dark:text-green-400',
    absent: 'text-red-700 dark:text-red-400',
    late: 'text-yellow-700 dark:text-yellow-400',
};

export default function AttendanceCalendar({
    batches,
    students,
    calendarData,
    summary,
    batchId,
    month,
}: Props) {
    const { t } = useLocale();

    const [year, monthNum] = month.split('-').map(Number);
    const daysInMonth = getDaysInMonth(year, monthNum);
    const firstDay = getFirstDayOfMonth(year, monthNum);

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const weeks = useMemo(() => {
        const cells: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(d);

        const result: (number | null)[][] = [];
        for (let i = 0; i < cells.length; i += 7) {
            result.push(cells.slice(i, i + 7));
        }
        return result;
    }, [firstDay, daysInMonth]);

    const navigateMonth = useCallback((offset: number) => {
        const d = new Date(year, monthNum - 1 + offset, 1);
        const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        router.get(
            attendance.calendar().url,
            { batch_id: batchId, month: newMonth },
            { preserveState: true },
        );
    }, [year, monthNum, batchId]);

    const handleBatchChange = (value: string) => {
        router.get(
            attendance.calendar().url,
            { batch_id: value || undefined, month },
            { preserveState: true },
        );
    };

    const getDayStatuses = (day: number): Record<string, string> => {
        const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return calendarData[dateStr] || {};
    };

    const getDayTotals = (day: number) => {
        const statuses = getDayStatuses(day);
        const vals = Object.values(statuses);
        return {
            total: vals.length,
            present: vals.filter((s) => s === 'present').length,
            absent: vals.filter((s) => s === 'absent').length,
            late: vals.filter((s) => s === 'late').length,
        };
    };

    const monthName = new Date(year, monthNum - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

    const totalStudents = students.length;

    return (
        <>
            <Head title={`${t('attendance.title')} — ${monthName}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title={t('attendance.calendar')}
                        description={monthName}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Select value={batchId?.toString() || ''} onValueChange={handleBatchChange}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="All Batches" />
                        </SelectTrigger>
                        <SelectContent>
                            {batches.map((b) => (
                                <SelectItem key={b.id} value={b.id.toString()}>
                                    {b.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="size-9" onClick={() => navigateMonth(-1)}>
                            <ChevronLeft className="size-4" />
                        </Button>
                        <span className="min-w-[140px] text-center text-sm font-medium">{monthName}</span>
                        <Button variant="outline" size="icon" className="size-9" onClick={() => navigateMonth(1)}>
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>

                    <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-green-500" /> Present</span>
                        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-red-500" /> Absent</span>
                        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-yellow-500" /> Late</span>
                    </div>
                </div>

                {batchId ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid gap-4 sm:grid-cols-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{totalStudents}</p>
                                    <p className="text-xs text-muted-foreground">Students</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">{summary.present}</p>
                                    <p className="text-xs text-muted-foreground">Present</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
                                    <p className="text-xs text-muted-foreground">Absent</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-yellow-600">{summary.late}</p>
                                    <p className="text-xs text-muted-foreground">Late</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : null}

                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-7 gap-px text-xs text-muted-foreground">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                                <div key={d} className="py-2 text-center font-medium">{d}</div>
                            ))}
                        </div>

                        {batchId ? (
                            <div className="grid grid-cols-7 gap-px">
                                {weeks.flat().map((day, idx) => {
                                    if (day === null) {
                                        return <div key={`empty-${idx}`} className="min-h-[80px] bg-muted/20" />;
                                    }

                                    const totals = getDayTotals(day);
                                    const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                    const isToday = dateStr === todayStr;

                                    return (
                                        <div
                                            key={day}
                                            className={`min-h-[80px] rounded-md border border-border/30 p-1.5 transition-colors hover:bg-muted/30 ${
                                                isToday ? 'bg-primary/5 ring-1 ring-primary/20' : ''
                                            }`}
                                        >
                                            <div className={`mb-1 text-[10px] font-medium ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                                                {day}
                                            </div>
                                            {totals.total > 0 ? (
                                                <div className="flex flex-wrap gap-0.5">
                                                    {totals.present > 0 && (
                                                        <span className="flex items-center justify-center rounded bg-green-500/10 px-1 py-0.5 text-[9px] font-medium text-green-700 dark:text-green-400">
                                                            {totals.present}P
                                                        </span>
                                                    )}
                                                    {totals.absent > 0 && (
                                                        <span className="flex items-center justify-center rounded bg-red-500/10 px-1 py-0.5 text-[9px] font-medium text-red-700 dark:text-red-400">
                                                            {totals.absent}A
                                                        </span>
                                                    )}
                                                    {totals.late > 0 && (
                                                        <span className="flex items-center justify-center rounded bg-yellow-500/10 px-1 py-0.5 text-[9px] font-medium text-yellow-700 dark:text-yellow-400">
                                                            {totals.late}L
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[9px] text-muted-foreground/50">—</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <CalendarDays className="mb-3 size-10 opacity-40" />
                                <p className="text-sm">Select a batch to view the attendance calendar</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {batchId && students.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Student Summary — {monthName}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="max-h-[400px] overflow-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground">
                                            <th className="sticky left-0 z-10 bg-background py-2 pr-4 font-medium">Student</th>
                                            <th className="px-3 py-2 text-center font-medium text-green-600">P</th>
                                            <th className="px-3 py-2 text-center font-medium text-red-600">A</th>
                                            <th className="px-3 py-2 text-center font-medium text-yellow-600">L</th>
                                            <th className="px-3 py-2 text-center font-medium">Total</th>
                                            <th className="px-3 py-2 text-center font-medium">Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student) => {
                                            let p = 0, a = 0, l = 0;
                                            for (let d = 1; d <= daysInMonth; d++) {
                                                const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                                const status = calendarData[dateStr]?.[student.id];
                                                if (status === 'present') p++;
                                                else if (status === 'absent') a++;
                                                else if (status === 'late') l++;
                                            }
                                            const total = p + a + l;
                                            const rate = total > 0 ? Math.round((p / total) * 100) : null;

                                            return (
                                                <tr key={student.id} className="border-b border-border/40">
                                                    <td className="sticky left-0 z-10 bg-background py-2 pr-4 font-medium whitespace-nowrap">{student.name}</td>
                                                    <td className="px-3 py-2 text-center text-green-600">{p || '—'}</td>
                                                    <td className="px-3 py-2 text-center text-red-600">{a || '—'}</td>
                                                    <td className="px-3 py-2 text-center text-yellow-600">{l || '—'}</td>
                                                    <td className="px-3 py-2 text-center">{total || '—'}</td>
                                                    <td className="px-3 py-2 text-center">
                                                        {rate !== null ? (
                                                            <Badge variant={rate >= 80 ? 'default' : rate >= 60 ? 'secondary' : 'destructive'}>
                                                                {rate}%
                                                            </Badge>
                                                        ) : '—'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

AttendanceCalendar.layout = {
    breadcrumbs: [
        { title: 'Attendance', href: attendance.index() },
        { title: 'Calendar', href: attendance.calendar() },
    ],
};
