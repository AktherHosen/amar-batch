import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import attendance from '@/routes/attendance';
import { useLocale } from '@/contexts/locale-context';

type Batch = {
    id: number;
    name: string;
};

type StudentAttendance = {
    id: number;
    name: string;
    status: 'present' | 'absent' | 'late' | null;
    attendance_id?: number;
    notes: string;
};

type PageProps = {
    batches: Batch[];
    students: StudentAttendance[];
    selectedBatch: string;
    selectedDate: string;
};

export default function AttendanceCreate({ batches, students, selectedBatch, selectedDate }: PageProps) {
    const { t } = useLocale();
    const [batchId, setBatchId] = useState(selectedBatch || '');
    const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
    const [studentList, setStudentList] = useState<StudentAttendance[]>(students);

    useEffect(() => {
        setStudentList(students);
    }, [students]);

    const handleBatchChange = (value: string) => {
        setBatchId(value);
        if (value && date) {
            router.get(attendance.create(), { batch_id: value, date }, { preserveState: true, replace: true });
        }
    };

    const handleDateChange = (value: string) => {
        setDate(value);
        if (batchId && value) {
            router.get(attendance.create(), { batch_id: batchId, date: value }, { preserveState: true, replace: true });
        }
    };

    const updateStatus = (studentId: number, status: 'present' | 'absent' | 'late' | null) => {
        setStudentList((prev) =>
            prev.map((s) => (s.id === studentId ? { ...s, status } : s))
        );
    };

    const markAll = (status: 'present' | 'absent' | 'late' | null) => {
        setStudentList((prev) => prev.map((s) => ({ ...s, status })));
    };

    const updateNotes = (studentId: number, notes: string) => {
        setStudentList((prev) =>
            prev.map((s) => (s.id === studentId ? { ...s, notes } : s))
        );
    };

    const handleSubmit = () => {
        if (!batchId || !date || studentList.length === 0) return;

        router.post(attendance.store(), {
            batch_id: parseInt(batchId),
            date,
            attendances: studentList.map((s) => ({
                student_id: s.id,
                status: s.status,
                notes: s.notes || null,
            })),
        });
    };

    return (
        <>
            <Head title={t('attendance.mark')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading title={t('attendance.mark')} description={t('attendance.title')} />

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="space-y-2">
                                <Label>{t('attendance.batch')}</Label>
                                <Select value={batchId} onValueChange={handleBatchChange}>
                                    <SelectTrigger className="w-[250px]">
                                        <SelectValue placeholder="Select a batch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {batches.map((batch) => (
                                            <SelectItem key={batch.id} value={batch.id.toString()}>
                                                {batch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>{t('attendance.date')}</Label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    className="w-[200px]"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {batchId && studentList.length > 0 ? (
                            <>
                                <div className="flex gap-2 mb-4">
                                    <Button size="sm" variant="outline" onClick={() => markAll('present')}>
                                        {t('attendance.mark_all_present')}
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => markAll('absent')}>
                                        {t('attendance.mark_all_absent')}
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => markAll(null)}>
                                        {t('attendance.clear_all')}
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('attendance.student')}</TableHead>
                                            <TableHead>{t('attendance.status')}</TableHead>
                                            <TableHead>{t('attendance.notes')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {studentList.map((student) => (
                                            <TableRow key={student.id}>
                                                <TableCell className="font-medium">
                                                    {student.name}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant={student.status === 'present' ? 'default' : 'outline'}
                                                            onClick={() => updateStatus(student.id, 'present')}
                                                        >
                                                            P
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={student.status === 'absent' ? 'destructive' : 'outline'}
                                                            onClick={() => updateStatus(student.id, 'absent')}
                                                        >
                                                            A
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={student.status === 'late' ? 'secondary' : 'outline'}
                                                            onClick={() => updateStatus(student.id, 'late')}
                                                        >
                                                            L
                                                        </Button>
                                                        {student.status !== null && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => updateStatus(student.id, null)}
                                                            >
                                                                Clear
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        placeholder="Optional notes..."
                                                        value={student.notes}
                                                        onChange={(e) => updateNotes(student.id, e.target.value)}
                                                        className="w-[250px]"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="mt-4 flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => window.history.back()}>
                                        {t('actions.cancel')}
                                    </Button>
                                    <Button onClick={handleSubmit}>
                                        {t('attendance.save')}
                                    </Button>
                                </div>
                            </>
                        ) : batchId ? (
                            <p className="text-sm text-muted-foreground">No enrolled students found for this batch.</p>
                        ) : (
                            <p className="text-sm text-muted-foreground">Select a batch and date to mark attendance.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AttendanceCreate.layout = {
    breadcrumbs: [
        {
            title: 'Attendance',
            href: attendance.index(),
        },
        {
            title: 'Mark',
            href: '#',
        },
    ],
};
