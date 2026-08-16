import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DataTable, type DataTableProps } from '@/components/data-table';
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

export default function AttendanceCreate({
    batches,
    students,
    selectedBatch,
    selectedDate,
}: PageProps) {
    const { t } = useLocale();
    const [batchId, setBatchId] = useState(selectedBatch || '');
    const [date, setDate] = useState(
        selectedDate || new Date().toISOString().split('T')[0],
    );
    const [studentList, setStudentList] =
        useState<StudentAttendance[]>(students);

    const handleBatchChange = (value: string) => {
        setBatchId(value);

        if (value && date) {
            router.get(
                attendance.create(),
                { batch_id: value, date },
                { preserveState: false, replace: true },
            );
        }
    };

    const handleDateChange = (value: string) => {
        setDate(value);

        if (batchId && value) {
            router.get(
                attendance.create(),
                { batch_id: batchId, date: value },
                { preserveState: false, replace: true },
            );
        }
    };

    const updateStatus = (
        studentId: number,
        status: 'present' | 'absent' | 'late' | null,
    ) => {
        setStudentList((prev) =>
            prev.map((s) => (s.id === studentId ? { ...s, status } : s)),
        );
    };

    const markAll = (status: 'present' | 'absent' | 'late' | null) => {
        setStudentList((prev) => prev.map((s) => ({ ...s, status })));
    };

    const updateNotes = (studentId: number, notes: string) => {
        setStudentList((prev) =>
            prev.map((s) => (s.id === studentId ? { ...s, notes } : s)),
        );
    };

    const handleSubmit = () => {
        if (!batchId || !date || studentList.length === 0) {
            return;
        }

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

    const columns = (() => {
        type Col = NonNullable<DataTableProps<StudentAttendance, unknown>['columns']>[number];
        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: t('attendance.student'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">{row.original.name}</span>
                ),
            } as Col,
            {
                id: 'status',
                accessorKey: 'status',
                header: t('attendance.status'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const student: StudentAttendance = row.original;
                    return (
                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                variant={
                                    student.status === 'present'
                                        ? 'default'
                                        : 'outline'
                                }
                                className="w-full sm:w-auto"
                                onClick={() =>
                                    updateStatus(student.id, 'present')
                                }
                            >
                                P
                            </Button>
                            <Button
                                size="sm"
                                variant={
                                    student.status === 'absent'
                                        ? 'destructive'
                                        : 'outline'
                                }
                                className="w-full sm:w-auto"
                                onClick={() =>
                                    updateStatus(student.id, 'absent')
                                }
                            >
                                A
                            </Button>
                            <Button
                                size="sm"
                                variant={
                                    student.status === 'late'
                                        ? 'secondary'
                                        : 'outline'
                                }
                                className="w-full sm:w-auto"
                                onClick={() =>
                                    updateStatus(student.id, 'late')
                                }
                            >
                                L
                            </Button>
                            {student.status !==
                                null && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="px-2"
                                    onClick={() =>
                                        updateStatus(
                                            student.id,
                                            null,
                                        )
                                    }
                                >
                                    ✕
                                </Button>
                            )}
                        </div>
                    );
                },
            } as Col,
            {
                id: 'notes',
                accessorKey: 'notes',
                header: t('attendance.notes'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const student: StudentAttendance = row.original;
                    return (
                        <Input
                            placeholder="Notes..."
                            value={student.notes}
                            onChange={(e) =>
                                updateNotes(
                                    student.id,
                                    e.target.value,
                                )
                            }
                            className="w-full"
                        />
                    );
                },
            } as Col,
        ];
    })();

    return (
        <>
            <Head title={t('attendance.mark')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <Heading
                        title={t('attendance.title')}
                        description={t('attendance.desc')}
                    />

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1 space-y-2">
                                <Label>{t('attendance.batch')}</Label>
                                <Select
                                    value={batchId}
                                    onValueChange={handleBatchChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a batch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {batches.map((batch) => (
                                            <SelectItem
                                                key={batch.id}
                                                value={batch.id.toString()}
                                            >
                                                {batch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full space-y-2 sm:w-auto sm:max-w-[200px]">
                                <Label>{t('attendance.date')}</Label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) =>
                                        handleDateChange(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {batchId && studentList.length > 0 ? (
                            <>
                                <div className="mb-4 flex flex-wrap gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 sm:flex-none"
                                        onClick={() => markAll('present')}
                                    >
                                        {t('attendance.mark_all_present')}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 sm:flex-none"
                                        onClick={() => markAll('absent')}
                                    >
                                        {t('attendance.mark_all_absent')}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 sm:flex-none"
                                        onClick={() => markAll(null)}
                                    >
                                        {t('attendance.clear_all')}
                                    </Button>
                                </div>
                                <DataTable
                                    columns={columns}
                                    data={studentList}
                                    showPagination={false}
                                    emptyMessage="No students"
                                    getRowId={(row) => String(row.id)}
                                />

                                <div className="mt-4 flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                    >
                                        {t('actions.cancel')}
                                    </Button>
                                    <Button onClick={handleSubmit}>
                                        {t('attendance.save')}
                                    </Button>
                                </div>
                            </>
                        ) : batchId ? (
                            <p className="text-sm text-muted-foreground">
                                No enrolled students found for this batch.
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Select a batch and date to mark attendance.
                            </p>
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
