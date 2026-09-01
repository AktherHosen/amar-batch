import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Download,
    PenLine,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    GraduationCap,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import type { DataTableProps } from '@/components/data-table';
import StudentForm from '@/components/student-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useLocale } from '@/contexts/locale-context';
import { getGrade, getGradeBadgeVariant } from '@/lib/grades';
import { generateTablePDF } from '@/lib/pdf-table';
import { isOwner } from '@/lib/role';
import students from '@/routes/students';
import type { Student } from '@/types';

type PageProps = {
    auth: { user: { role: string } };
    tenant: { primary_color: string; name: string } | null;
    errors: Record<string, string>;
};

type StudentsShowProps = {
    student: Student;
    attendanceSummary: Record<number, Record<number, Record<string, number>>>;
    coachingClasses: { id: number; name: string }[];
    existingParents?: Array<{ id: number; name: string; email: string }>;
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
    created_at: string | null;
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
    coachingClasses,
    existingParents = [],
}: StudentsShowProps) {
    const { t } = useLocale();
    const { auth, tenant, errors: pageErrors } = usePage<PageProps>().props;
    const isAdmin = isOwner(auth.user);
    const primaryColor = tenant?.primary_color || '#6366f1';
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: any | null;
    }>({ open: false, item: null });
    const [editOpen, setEditOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

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

    const handleEditSubmit = (data: FormData) => {
        data.append('_method', 'PUT');
        setProcessing(true);
        router.post(students.update(student.id), data, {
            preserveScroll: true,
            onSuccess: () => {
                setEditOpen(false);
                setProcessing(false);
                toast.success(t('toast.updated_successfully'));
            },
            onError: () => {
                setProcessing(false);
            },
        });
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
            {
                id: 'grade',
                header: t('exams.grade'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const result: ExamResult = row.original;
                    const grade = getGrade(result.marks_obtained, result.exam.total_marks);
                    const variant = getGradeBadgeVariant(grade);
                    return <Badge variant={variant}>{grade}</Badge>;
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
            {
                id: 'created_at',
                accessorKey: 'created_at',
                header: t('fees.date'),
                enableSorting: true,
                cell: ({ row }: any) => {
                    const fee: FeeStatus = row.original;

                    return fee.created_at ? formatDate(fee.created_at) : '-';
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
                            <Sheet open={editOpen} onOpenChange={setEditOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="h-9">
                                        <PenLine className="size-4" />
                                        <span className="ml-2 hidden sm:inline">{t('actions.edit')}</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="sm:max-w-2xl overflow-y-auto">
                                    <SheetHeader>
                                        <SheetTitle>{t('actions.edit')} {student.name}</SheetTitle>
                                        <SheetDescription>
                                            {t('students.update_details')}
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="px-4 pb-4">
                                        <StudentForm
                                            student={student}
                                            coachingClasses={coachingClasses}
                                            existingParents={existingParents}
                                            onSubmit={handleEditSubmit}
                                            processing={processing}
                                            errors={pageErrors}
                                            hideActions
                                        />
                                    </div>
                                    <SheetFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setEditOpen(false)}
                                        >
                                            {t('actions.cancel')}
                                        </Button>
                                        <Button type="submit" form="student-form" disabled={processing}>
                                            {processing ? t('actions.updating') : t('actions.update')}
                                        </Button>
                                    </SheetFooter>
                                </SheetContent>
                            </Sheet>
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
                    {/* Premium Student ID Card */}
                    {(() => {
                        const hex = primaryColor;
                        const r = parseInt(hex.slice(1, 3), 16);
                        const g = parseInt(hex.slice(3, 5), 16);
                        const b = parseInt(hex.slice(5, 7), 16);

                        return (
                            <div
                                id="print-area"
                                className="print-id-card relative overflow-hidden rounded-2xl border shadow-lg"
                                style={{
                                    borderColor: `rgba(${r},${g},${b},0.15)`,
                                    boxShadow: `0 8px 32px rgba(${r},${g},${b},0.10), 0 2px 8px rgba(0,0,0,0.04)`,
                                }}
                            >
                                {/* Top accent bar */}
                                <div
                                    className="h-1.5"
                                    style={{ background: `linear-gradient(90deg, ${hex}, ${hex}cc, ${hex})` }}
                                />

                                {/* Header */}
                                <div
                                    className="flex items-center justify-between px-6 py-4"
                                    style={{ background: `linear-gradient(135deg, rgba(${r},${g},${b},0.06), rgba(${r},${g},${b},0.02))` }}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className="flex size-9 items-center justify-center rounded-xl"
                                            style={{ background: `rgba(${r},${g},${b},0.1)` }}
                                        >
                                            <GraduationCap className="size-5" style={{ color: hex }} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: hex }}>
                                                Student ID
                                            </p>
                                            <p className="text-[10px] font-medium text-muted-foreground">
                                                {tenant?.name || 'Amar Batch'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="rounded-lg px-3 py-1.5 text-xs font-bold"
                                            style={{
                                                background: `rgba(${r},${g},${b},0.08)`,
                                                color: hex,
                                            }}
                                        >
                                            {student.code}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => window.print()}
                                            className="print-hidden inline-flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                                            title="Download ID Card"
                                        >
                                            <Download className="size-4 text-muted-foreground" />
                                        </button>
                                    </div>
                                </div>

                                <div className="px-6 pt-5 pb-6">
                                    {/* Avatar + Name */}
                                    <div className="mb-5 flex items-center gap-4">
                                        <div
                                            className="relative flex size-20 shrink-0 items-center justify-center rounded-2xl border-2 sm:size-24"
                                            style={{
                                                borderColor: `rgba(${r},${g},${b},0.2)`,
                                                background: `linear-gradient(135deg, rgba(${r},${g},${b},0.08), rgba(${r},${g},${b},0.03))`,
                                            }}
                                        >
                                            {student.photo ? (
                                                <img
                                                    src={`/storage/${student.photo}`}
                                                    alt={student.name}
                                                    className="size-24 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <span
                                                    className="text-2xl font-bold sm:text-3xl"
                                                    style={{ color: hex }}
                                                >
                                                    {student.name
                                                        .split(' ')
                                                        .map((n) => n[0])
                                                        .join('')
                                                        .toUpperCase()
                                                        .slice(0, 2)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                                                {student.name}
                                            </h2>
                                            <p className="mt-0.5 text-sm font-medium text-muted-foreground">
                                                {student.coaching_class
                                                    ? `${student.coaching_class.name}${student.section ? ` - ${student.section}` : ''}`
                                                    : student.section || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div
                                        className="mb-5 h-px"
                                        style={{
                                            background: `linear-gradient(90deg, transparent, rgba(${r},${g},${b},0.2), transparent)`,
                                        }}
                                    />

                                    {/* Info grid */}
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                        <div>
                                            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                                                {t('students.phone')}
                                            </p>
                                            <p className="text-sm font-semibold">
                                                {student.phone || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                                                {t('students.joined_at')}
                                            </p>
                                            <p className="text-sm font-semibold">
                                                {formatDate(student.joined_at)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                                                {t('students.date_of_birth')}
                                            </p>
                                            <p className="text-sm font-semibold">
                                                {formatDate(student.date_of_birth)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                                                {t('students.gender')}
                                            </p>
                                            <p className="text-sm font-semibold capitalize">
                                                {student.gender || '-'}
                                            </p>
                                        </div>
                                        {student.left_at && (
                                            <div className="col-span-2">
                                                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                                                    {t('students.left_at')}
                                                </p>
                                                <p className="text-sm font-semibold">
                                                    {formatDate(student.left_at)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

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
                                                <span className="text-xl font-bold sm:text-2xl">
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
                                                <span className="text-xl font-bold text-green-600 sm:text-2xl">
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

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #print-area,
                    #print-area * {
                        visibility: visible;
                    }
                    #print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        border: 1px solid #e5e7eb !important;
                        box-shadow: none !important;
                        border-radius: 10px !important;
                        max-width: 520px !important;
                        width: 100% !important;
                        margin: 0 !important;
                        page-break-inside: avoid;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    #print-area .px-6 {
                        padding-left: 1rem !important;
                        padding-right: 1rem !important;
                    }
                    #print-area .pt-5 {
                        padding-top: 0.75rem !important;
                    }
                    #print-area .pb-6 {
                        padding-bottom: 0.75rem !important;
                    }
                    #print-area .gap-x-6 {
                        column-gap: 1rem !important;
                    }
                    #print-area .gap-y-4 {
                        row-gap: 0.5rem !important;
                    }
                    #print-area .mb-5 {
                        margin-bottom: 0.5rem !important;
                    }
                    #print-area .py-4 {
                        padding-top: 0.5rem !important;
                        padding-bottom: 0.5rem !important;
                    }
                    #print-area .print-hidden {
                        display: none !important;
                    }
                    @page {
                        margin: 1.5cm;
                        size: A4 portrait;
                    }
                }
            `}</style>
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
