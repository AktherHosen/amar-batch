import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Download,
    Pencil,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable  } from '@/components/data-table';
import type {DataTableProps} from '@/components/data-table';
import Heading from '@/components/heading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';
import { generateTablePDF } from '@/lib/pdf-table';
import { isOwner } from '@/lib/role';
import students from '@/routes/students';
import type { Student } from '@/types';

type PageProps = {
    auth: { user: { role: string } };
    tenant: { primary_color: string; name: string } | null;
};

type StudentsShowProps = {
    student: Student;
    attendanceSummary: Record<number, Record<number, Record<string, number>>>;
};

type StudentEnrollment = {
    id: number;
    batch: { id: number; name: string; subject: string | null } | null;
    enrolled_at: string;
    status: string;
};

type FeeStatus = {
    id: number;
    batch: { id: number; name: string };
    month: number;
    year: number;
    amount_paid: number;
    notes: string | null;
};

type AttendanceRow = {
    key: string;
    year: string;
    month: string;
    monthName: string;
    present: number;
    absent: number;
    late: number;
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
        batch: { id: number; name: string } | null;
    };
    marks_obtained: number;
    notes: string | null;
};

type BatchHistoryItem = {
    id: number;
    batch: { id: number; name: string } | null;
    user: { name: string } | null;
    action: string;
    action_date: string | null;
    notes: string | null;
    created_at: string;
};

const MONTH_NAMES = [
    '',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

function formatDate(dateStr: string | null): string {
    if (!dateStr) {
        return '-';
    }

    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
}

export default function StudentsShow({
    student,
    attendanceSummary,
}: StudentsShowProps) {
    const { t } = useLocale();
    const { auth, tenant } = usePage<PageProps>().props;
    const isAdmin = isOwner(auth.user);
    const primaryColor = tenant?.primary_color || '#6366f1';
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: any | null;
    }>({ open: false, item: null });

    const handleDelete = () => {
        setDeleteDialog({ open: true, item: student });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(students.destroy(deleteDialog.item.id));
            toast.success(t('toast.deleted_successfully'));
            setDeleteDialog({ open: false, item: null });
        }
    };

    const attendanceRows: AttendanceRow[] = Object.entries(attendanceSummary)
        .sort(([a], [b]) => Number(b) - Number(a))
        .flatMap(([year, months]) =>
            Object.entries(months)
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([month, counts]) => ({
                    key: `${year}-${month}`,
                    year,
                    month,
                    monthName: MONTH_NAMES[Number(month)],
                    present: counts.present || 0,
                    absent: counts.absent || 0,
                    late: counts.late || 0,
                })),
        );

    const enrollmentColumns = (() => {
        type Col = NonNullable<
            DataTableProps<StudentEnrollment, unknown>['columns']
        >[number];

        return [
            {
                id: 'batch_name',
                accessorKey: 'batch.name',
                header: t('batches.name'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => {
                    const enrollment: StudentEnrollment = row.original;

                    return (
                        <span className="font-medium">
                            {enrollment.batch?.name}
                        </span>
                    );
                },
            } as Col,
            {
                id: 'subject',
                accessorKey: 'batch.subject',
                header: t('batches.subject'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const enrollment: StudentEnrollment = row.original;

                    return enrollment.batch?.subject || '-';
                },
            } as Col,
            {
                id: 'enrolled_at',
                accessorKey: 'enrolled_at',
                header: t('students.joined_at'),
                enableSorting: true,
                cell: ({ row }: any) => formatDate(row.original.enrolled_at),
            } as Col,
            {
                id: 'status',
                accessorKey: 'status',
                header: t('students.status'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const enrollment: StudentEnrollment = row.original;

                    return (
                        <Badge
                            variant={
                                enrollment.status === 'active'
                                    ? 'default'
                                    : enrollment.status === 'completed'
                                      ? 'secondary'
                                      : 'destructive'
                            }
                        >
                            {enrollment.status}
                        </Badge>
                    );
                },
            } as Col,
        ];
    })();

    const attendanceColumns = (() => {
        type Col = NonNullable<
            DataTableProps<AttendanceRow, unknown>['columns']
        >[number];

        return [
            {
                id: 'month',
                accessorKey: 'monthName',
                header: t('fees.month'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">
                        {row.original.monthName}
                    </span>
                ),
            } as Col,
            {
                id: 'year',
                accessorKey: 'year',
                header: t('fees.year'),
                enableSorting: true,
                cell: ({ row }: any) => <span>{row.original.year}</span>,
            } as Col,
            {
                id: 'present',
                accessorKey: 'present',
                header: t('attendance.present'),
                enableSorting: false,
                cell: ({ row }: any) => (
                    <span className="text-center text-green-600">
                        {row.original.present}
                    </span>
                ),
            } as Col,
            {
                id: 'absent',
                accessorKey: 'absent',
                header: t('attendance.absent'),
                enableSorting: false,
                cell: ({ row }: any) => (
                    <span className="text-center text-red-600">
                        {row.original.absent}
                    </span>
                ),
            } as Col,
            {
                id: 'late',
                accessorKey: 'late',
                header: t('attendance.late'),
                enableSorting: false,
                cell: ({ row }: any) => (
                    <span className="text-center text-yellow-600">
                        {row.original.late}
                    </span>
                ),
            } as Col,
        ];
    })();

    const examColumns = (() => {
        type Col = NonNullable<
            DataTableProps<ExamResult, unknown>['columns']
        >[number];

        return [
            {
                id: 'title',
                accessorKey: 'exam.title',
                header: t('exams.title'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">
                        {row.original.exam.title}
                    </span>
                ),
            } as Col,
            {
                id: 'subject',
                accessorKey: 'exam.subject',
                header: t('exams.subject'),
                enableSorting: false,
                cell: ({ row }: any) => (
                    <span>{row.original.exam.subject}</span>
                ),
            } as Col,
            {
                id: 'batch',
                accessorKey: 'exam.batch.name',
                header: t('batches.name'),
                enableSorting: false,
                cell: ({ row }: any) => row.original.exam.batch?.name || '-',
            } as Col,
            {
                id: 'date',
                accessorKey: 'exam.exam_date',
                header: t('exams.date'),
                enableSorting: true,
                cell: ({ row }: any) => formatDate(row.original.exam.exam_date),
            } as Col,
            {
                id: 'marks',
                accessorKey: 'marks_obtained',
                header: t('exams.marks'),
                enableSorting: true,
                cell: ({ row }: any) => {
                    const result: ExamResult = row.original;
                    const passed =
                        result.marks_obtained >= result.exam.passing_marks;

                    return (
                        <span
                            className={`font-medium ${passed ? 'text-green-600' : 'text-red-600'}`}
                        >
                            {result.marks_obtained}/{result.exam.total_marks}
                        </span>
                    );
                },
            } as Col,
        ];
    })();

    const batchHistoryColumns = (() => {
        type Col = NonNullable<
            DataTableProps<BatchHistoryItem, unknown>['columns']
        >[number];

        return [
            {
                id: 'date',
                accessorKey: 'action_date',
                header: t('batches.date'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => {
                    const item: BatchHistoryItem = row.original;

                    return (
                        <span className="font-medium">
                            {item.action_date
                                ? new Date(
                                      item.action_date,
                                  ).toLocaleDateString()
                                : new Date(
                                      item.created_at,
                                  ).toLocaleDateString()}
                        </span>
                    );
                },
            } as Col,
            {
                id: 'batch',
                accessorKey: 'batch.name',
                header: t('batches.name'),
                enableSorting: false,
                cell: ({ row }: any) => row.original.batch?.name || '-',
            } as Col,
            {
                id: 'action',
                accessorKey: 'action',
                header: t('batches.action'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const item: BatchHistoryItem = row.original;

                    return (
                        <Badge
                            variant={
                                item.action === 'enrolled'
                                    ? 'default'
                                    : item.action === 'completed'
                                      ? 'success'
                                      : 'danger'
                            }
                        >
                            {item.action}
                        </Badge>
                    );
                },
            } as Col,
            {
                id: 'by',
                accessorKey: 'user.name',
                header: t('batches.by'),
                enableSorting: false,
                cell: ({ row }: any) => row.original.user?.name || '-',
            } as Col,
        ];
    })();

    const feeColumns = (() => {
        type Col = NonNullable<
            DataTableProps<FeeStatus, unknown>['columns']
        >[number];

        return [
            {
                id: 'month',
                accessorKey: 'month',
                header: t('fees.month'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => {
                    const fee: FeeStatus = row.original;

                    return (
                        <span className="font-medium">
                            {MONTH_NAMES[fee.month]}
                        </span>
                    );
                },
            } as Col,
            {
                id: 'year',
                accessorKey: 'year',
                header: t('fees.year'),
                enableSorting: true,
                cell: ({ row }: any) => <span>{row.original.year}</span>,
            } as Col,
            {
                id: 'batch_name',
                accessorKey: 'batch.name',
                header: t('batches.name'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const fee: FeeStatus = row.original;

                    return fee.batch?.name || '-';
                },
            } as Col,
            {
                id: 'amount_paid',
                accessorKey: 'amount_paid',
                header: t('fees.amount_paid'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const fee: FeeStatus = row.original;

                    return (
                        <span className="text-right font-medium">
                            {Number(fee.amount_paid).toFixed(0)}
                        </span>
                    );
                },
            } as Col,
            {
                id: 'notes',
                accessorKey: 'notes',
                header: t('attendance.notes'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const fee: FeeStatus = row.original;

                    return fee.notes || '-';
                },
            } as Col,
        ];
    })();

    return (
        <>
            <Head title={student.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex min-w-0 items-center justify-between">
                    <div className="flex min-w-0 items-center gap-2">
                        <Link href={students.index()} className="shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-9"
                            >
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <h1 className="truncate text-lg font-bold tracking-tight sm:text-2xl">
                            {student.name}
                        </h1>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-2">
                            <Link href={students.edit(student.id)}>
                                <Button variant="outline" className="h-9">
                                    <Pencil className="size-4" />
                                    <span className="ml-2 hidden sm:inline">{t('actions.edit')}</span>
                                </Button>
                            </Link>
                            <Button
                                variant="destructive"
                                className="h-9"
                                onClick={handleDelete}
                            >
                                <Trash2 className="size-4" />
                                <span className="ml-2 hidden sm:inline">{t('actions.delete')}</span>
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('students.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center gap-4">
                                <Avatar className="size-16 sm:size-20">
                                    <AvatarImage
                                        src={
                                            student.photo
                                                ? `/storage/${student.photo}`
                                                : undefined
                                        }
                                        alt={student.name}
                                    />
                                    <AvatarFallback className="text-xl">
                                        {student.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid w-full grid-cols-2 gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">
                                            {t('students.name')}
                                        </p>
                                        <p className="truncate text-sm font-medium">
                                            {student.name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('students.phone')}
                                        </p>
                                        <p className="text-sm font-medium">
                                            {student.phone || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('students.class')}
                                        </p>
                                        <p className="text-sm font-medium">
                                            {student.coaching_class
                                                ? `${student.coaching_class.name}${student.section ? ` - ${student.section}` : ''}`
                                                : student.section || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('students.joined_at')}
                                        </p>
                                        <p className="text-sm font-medium">
                                            {formatDate(student.joined_at)}
                                        </p>
                                    </div>
                                    {student.left_at && (
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                {t('students.left_at')}
                                            </p>
                                            <p className="text-sm font-medium">
                                                {formatDate(student.left_at)}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('students.date_of_birth')}
                                        </p>
                                        <p className="text-sm font-medium">
                                            {formatDate(student.date_of_birth)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('students.gender')}
                                        </p>
                                        <p className="text-sm font-medium capitalize">
                                            {student.gender || '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">
                                    {t('attendance.summary')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {(() => {
                                    let totalPresent = 0;
                                    let totalAbsent = 0;
                                    let totalLate = 0;
                                    Object.values(attendanceSummary).forEach(
                                        (months) => {
                                            Object.values(months).forEach(
                                                (counts) => {
                                                    totalPresent +=
                                                        counts.present || 0;
                                                    totalAbsent +=
                                                        counts.absent || 0;
                                                    totalLate +=
                                                        counts.late || 0;
                                                },
                                            );
                                        },
                                    );
                                    const total =
                                        totalPresent + totalAbsent + totalLate;
                                    const percentage =
                                        total > 0
                                            ? Math.round(
                                                  (totalPresent / total) * 100,
                                              )
                                            : 0;

                                    return total > 0 ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl font-bold">
                                                    {percentage}%
                                                </span>
                                                <Badge
                                                    variant={
                                                        percentage >= 75
                                                            ? 'success'
                                                            : percentage >= 50
                                                              ? 'secondary'
                                                              : 'destructive'
                                                    }
                                                >
                                                    {percentage >= 75
                                                        ? t('attendance.good')
                                                        : percentage >= 50
                                                          ? t(
                                                                'attendance.average',
                                                            )
                                                          : t('attendance.low')}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle className="size-3 text-green-600" />
                                                    <span>
                                                        {totalPresent}{' '}
                                                        {t(
                                                            'attendance.present',
                                                        ).toLowerCase()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <XCircle className="size-3 text-red-600" />
                                                    <span>
                                                        {totalAbsent}{' '}
                                                        {t(
                                                            'attendance.absent',
                                                        ).toLowerCase()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="size-3 text-yellow-600" />
                                                    <span>
                                                        {totalLate}{' '}
                                                        {t(
                                                            'attendance.late',
                                                        ).toLowerCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full bg-green-600"
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            {t('students.no_attendance')}
                                        </p>
                                    );
                                })()}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">
                                    Payment Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {(() => {
                                    const fees = student.fee_statuses || [];
                                    const totalPaid = fees.reduce(
                                        (sum, f) => sum + Number(f.amount_paid),
                                        0,
                                    );
                                    const feeCount = fees.length;

                                    return feeCount > 0 ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl font-bold text-green-600">
                                                    {totalPaid.toFixed(0)}
                                                </span>
                                                <Badge variant="success">
                                                    {feeCount}{' '}
                                                    {feeCount === 1
                                                        ? 'payment'
                                                        : 'payments'}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {t('fees.amount_paid')}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            {t('students.no_payments')}
                                        </p>
                                    );
                                })()}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {student.enrollments && student.enrollments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {t('batches.enrolled')} (
                                {student.enrollments.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={enrollmentColumns}
                                data={student.enrollments ?? []}
                                showPagination={false}
                                searchable
                                searchPlaceholder={
                                    t('batches.enrolled') + '...'
                                }
                                emptyMessage={t('students.no_enrollments')}
                                getRowId={(row) => String(row.id)}
                                toolbarEnd={
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 shrink-0 gap-1 px-2.5 sm:gap-2 sm:px-3"
                                        onClick={() =>
                                            generateTablePDF({
                                                title: `${student.name} - ${t('students.title')}`,
                                                headers: [
                                                    t('batches.name'),
                                                    t('batches.subject'),
                                                    t('students.joined_at'),
                                                    t('students.status'),
                                                ],
                                                rows: (
                                                    student.enrollments ?? []
                                                ).map((e) => [
                                                    e.batch?.name || '-',
                                                    e.batch?.subject || '-',
                                                    formatDate(e.enrolled_at),
                                                    e.status,
                                                ]),
                                                filename: `${student.name}_enrollments`,
                                                primaryColor,
                                                centerName: tenant?.name,
                                            })
                                        }
                                    >
                                        <Download className="size-4" />
                                        <span className="ml-2 hidden sm:inline">
                                            PDF
                                        </span>
                                    </Button>
                                }
                            />
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>{t('attendance.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={attendanceColumns}
                            data={attendanceRows}
                            showPagination={false}
                            searchable
                            searchPlaceholder={t('attendance.title') + '...'}
                            emptyMessage={t('students.no_attendance')}
                            getRowId={(row) => row.key}
                            toolbarEnd={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 shrink-0 gap-1 px-2.5 sm:gap-2 sm:px-3"
                                    onClick={() =>
                                        generateTablePDF({
                                            title: `${student.name} - ${t('attendance.title')}`,
                                            headers: [
                                                t('fees.month'),
                                                t('fees.year'),
                                                t('attendance.present'),
                                                t('attendance.absent'),
                                                t('attendance.late'),
                                            ],
                                            rows: attendanceRows.map((r) => [
                                                r.monthName,
                                                r.year,
                                                r.present,
                                                r.absent,
                                                r.late,
                                            ]),
                                            filename: `${student.name}_attendance`,
                                            primaryColor,
                                            centerName: tenant?.name,
                                        })
                                    }
                                >
                                    <Download className="size-4" />
                                    <span className="ml-2 hidden sm:inline">
                                        PDF
                                    </span>
                                </Button>
                            }
                        />
                    </CardContent>
                </Card>

                {student.examResults && student.examResults.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {t('exams.title')} ({student.examResults.length}
                                )
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={examColumns}
                                data={student.examResults}
                                showPagination={false}
                                searchable
                                searchPlaceholder={t('exams.title') + '...'}
                                emptyMessage={t('exams.no_results')}
                                getRowId={(row) => String(row.id)}
                                toolbarEnd={
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 shrink-0 gap-1 px-2.5 sm:gap-2 sm:px-3"
                                        onClick={() =>
                                            generateTablePDF({
                                                title: `${student.name} - ${t('exams.title')}`,
                                                headers: [
                                                    t('exams.title'),
                                                    t('exams.subject'),
                                                    t('batches.name'),
                                                    t('exams.date'),
                                                    t('exams.marks'),
                                                ],
                                                rows: (
                                                    student.examResults ?? []
                                                ).map((r) => [
                                                    r.exam.title,
                                                    r.exam.subject,
                                                    r.exam.batch?.name || '-',
                                                    formatDate(
                                                        r.exam.exam_date,
                                                    ),
                                                    `${r.marks_obtained}/${r.exam.total_marks}`,
                                                ]),
                                                filename: `${student.name}_exams`,
                                                primaryColor,
                                                centerName: tenant?.name,
                                            })
                                        }
                                    >
                                        <Download className="size-4" />
                                        <span className="ml-2 hidden sm:inline">
                                            PDF
                                        </span>
                                    </Button>
                                }
                            />
                        </CardContent>
                    </Card>
                )}

                {student.batchHistories &&
                    student.batchHistories.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t('batches.history')} (
                                    {student.batchHistories.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DataTable
                                    columns={batchHistoryColumns}
                                    data={student.batchHistories}
                                    showPagination={false}
                                    searchable
                                    searchPlaceholder={
                                        t('batches.history') + '...'
                                    }
                                    emptyMessage={t('batches.no_history')}
                                    getRowId={(row) => String(row.id)}
                                    toolbarEnd={
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 shrink-0 gap-1 px-2.5 sm:gap-2 sm:px-3"
                                            onClick={() =>
                                                generateTablePDF({
                                                    title: `${student.name} - ${t('batches.history')}`,
                                                    headers: [
                                                        t('batches.date'),
                                                        t('batches.name'),
                                                        t('batches.action'),
                                                        t('batches.by'),
                                                    ],
                                                    rows: (
                                                        student.batchHistories ??
                                                        []
                                                    ).map((h) => [
                                                        h.action_date
                                                            ? new Date(
                                                                  h.action_date,
                                                              ).toLocaleDateString()
                                                            : new Date(
                                                                  h.created_at,
                                                              ).toLocaleDateString(),
                                                        h.batch?.name || '-',
                                                        h.action,
                                                        h.user?.name || '-',
                                                    ]),
                                                    filename: `${student.name}_batch_history`,
                                                    primaryColor,
                                                    centerName: tenant?.name,
                                                })
                                            }
                                        >
                                            <Download className="size-4" />
                                            <span className="ml-2 hidden sm:inline">
                                                PDF
                                            </span>
                                        </Button>
                                    }
                                />
                            </CardContent>
                        </Card>
                    )}

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                        <CardTitle>{t('fees.payment_history')}</CardTitle>
                        {student.fee_statuses &&
                            student.fee_statuses.length > 0 && (
                                <div className="text-sm text-muted-foreground">
                                    Total Paid:{' '}
                                    <span className="font-bold text-green-600">
                                        {student.fee_statuses
                                            .reduce(
                                                (sum, f) =>
                                                    sum + Number(f.amount_paid),
                                                0,
                                            )
                                            .toFixed(0)}
                                    </span>
                                </div>
                            )}
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={feeColumns}
                            data={
                                student.fee_statuses
                                    ? [...student.fee_statuses].sort(
                                          (a, b) =>
                                              b.year - a.year ||
                                              b.month - a.month,
                                      )
                                    : []
                            }
                            showPagination={false}
                            searchable
                            searchPlaceholder={
                                t('fees.payment_history') + '...'
                            }
                            emptyMessage={t('students.no_payments')}
                            getRowId={(row) => String(row.id)}
                            toolbarEnd={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 shrink-0 gap-1 px-2.5 sm:gap-2 sm:px-3"
                                    onClick={() =>
                                        generateTablePDF({
                                            title: `${student.name} - ${t('fees.payment_history')}`,
                                            headers: [
                                                t('fees.month'),
                                                t('fees.year'),
                                                t('batches.name'),
                                                t('fees.amount_paid'),
                                                t('attendance.notes'),
                                            ],
                                            rows: (student.fee_statuses
                                                ? [
                                                      ...student.fee_statuses,
                                                  ].sort(
                                                      (a, b) =>
                                                          b.year - a.year ||
                                                          b.month - a.month,
                                                  )
                                                : []
                                            ).map((f) => [
                                                MONTH_NAMES[f.month],
                                                f.year,
                                                f.batch?.name || '-',
                                                Number(f.amount_paid).toFixed(
                                                    0,
                                                ),
                                                f.notes || '-',
                                            ]),
                                            filename: `${student.name}_payments`,
                                            primaryColor,
                                            centerName: tenant?.name,
                                        })
                                    }
                                >
                                    <Download className="size-4" />
                                    <span className="ml-2 hidden sm:inline">
                                        PDF
                                    </span>
                                </Button>
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    setDeleteDialog({ open, item: deleteDialog.item })
                }
                title={t('students.delete_title')}
                description={t('students.delete_confirm')}
                confirmText={t('actions.delete')}
                cancelText={t('actions.cancel')}
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

StudentsShow.layout = {
    breadcrumbs: [
        {
            title: 'Students',
            href: students.index(),
        },
        {
            title: 'View',
            href: '#',
        },
    ],
};
