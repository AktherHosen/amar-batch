import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { isOwner } from '@/lib/role';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable, type DataTableProps } from '@/components/data-table';
import exams from '@/routes/exams';
import { useLocale } from '@/contexts/locale-context';

type Student = {
    id: number;
    name: string;
};

type ExamResult = {
    id: number;
    student_id: number;
    marks_obtained: number;
    notes: string | null;
    student: { id: number; name: string };
};

type Exam = {
    id: number;
    title: string;
    subject: string | null;
    batch: { id: number; name: string } | null;
    date: string | null;
    total_marks: number;
    passing_marks: number;
    notes: string | null;
    results: ExamResult[];
};

type PageProps = {
    auth: { user: { role: string } };
};

type ExamsShowProps = {
    exam: Exam;
    students: Student[];
    enrolledStudentIds: number[];
};

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function ExamsShow({
    exam,
    students,
    enrolledStudentIds,
}: ExamsShowProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const isAdmin = isOwner(auth.user);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [results, setResults] = useState<
        Record<number, { marks: string; notes: string }>
    >(() => {
        const map: Record<number, { marks: string; notes: string }> = {};
        exam.results.forEach((r) => {
            map[r.student_id] = {
                marks: String(r.marks_obtained),
                notes: r.notes || '',
            };
        });
        return map;
    });

    const displayStudents =
        enrolledStudentIds.length > 0
            ? students.filter((s) => enrolledStudentIds.includes(s.id))
            : students;

    const handleDelete = () => {
        setDeleteDialog(true);
    };

    const confirmDelete = () => {
        router.delete(exams.destroy(exam.id), {
            onSuccess: () => toast.success(t('toast.deleted_successfully')),
        });
        setDeleteDialog(false);
    };

    const handleMarksChange = (studentId: number, value: string) => {
        setResults((prev) => ({
            ...prev,
            [studentId]: { ...prev[studentId], marks: value },
        }));
    };

    const handleNotesChange = (studentId: number, value: string) => {
        setResults((prev) => ({
            ...prev,
            [studentId]: { ...prev[studentId], notes: value },
        }));
    };

    const saveResults = () => {
        const payload = Object.entries(results)
            .filter(([_, v]) => v.marks !== '')
            .map(([studentId, v]) => ({
                student_id: Number(studentId),
                marks_obtained: Number(v.marks),
                notes: v.notes || null,
            }));

        router.post(
            exams.results.store(exam.id),
            { results: payload },
            {
                preserveScroll: true,
                onSuccess: () => toast.success(t('exams.results_saved')),
            },
        );
    };

    const columns = (() => {
        type Col = NonNullable<
            DataTableProps<Student, unknown>['columns']
        >[number];
        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: t('exams.student'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">{row.original.name}</span>
                ),
            } as Col,
            {
                id: 'marks_obtained',
                accessorKey: 'marks_obtained',
                header: t('exams.marks_obtained'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const student: Student = row.original;
                    return (
                        <Input
                            type="number"
                            min="0"
                            max={exam.total_marks}
                            className="w-24"
                            value={results[student.id]?.marks || ''}
                            onChange={(e) =>
                                handleMarksChange(student.id, e.target.value)
                            }
                        />
                    );
                },
            } as Col,
            {
                id: 'status',
                accessorKey: 'status',
                header: t('exams.status'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const student: Student = row.original;
                    const obtained = Number(results[student.id]?.marks || 0);
                    const passed = obtained >= exam.passing_marks;
                    const hasResult =
                        results[student.id]?.marks !== undefined &&
                        results[student.id]?.marks !== '';
                    return (
                        hasResult && (
                            <Badge
                                className={
                                    passed
                                        ? 'bg-green-600 text-white'
                                        : 'bg-red-600 text-white'
                                }
                            >
                                {passed ? t('exams.pass') : t('exams.fail')}
                            </Badge>
                        )
                    );
                },
            } as Col,
            {
                id: 'notes',
                accessorKey: 'notes',
                header: t('exams.notes'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const student: Student = row.original;
                    return (
                        <Input
                            className="w-48"
                            placeholder={t('exams.notes_placeholder')}
                            value={results[student.id]?.notes || ''}
                            onChange={(e) =>
                                handleNotesChange(student.id, e.target.value)
                            }
                        />
                    );
                },
            } as Col,
        ];
    })();

    return (
        <>
            <Head title={exam.title} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex min-w-0 items-center justify-between">
                    <div className="flex min-w-0 items-center gap-2">
                        <Link href={exams.index()} className="shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-9"
                            >
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <h1 className="truncate text-lg font-bold tracking-tight sm:text-2xl">
                            {exam.title}
                        </h1>
                    </div>
                    {isAdmin && (
                        <div className="flex shrink-0 gap-2">
                            <Link href={exams.edit(exam.id)}>
                                <Button variant="outline">
                                    <Pencil className="mr-2 size-4" />
                                    {t('actions.edit')}
                                </Button>
                            </Link>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                            >
                                <Trash2 className="mr-2 size-4" />
                                {t('actions.delete')}
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('exams.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">
                                        {t('exams.subject')}
                                    </p>
                                    <p className="truncate text-sm font-medium">
                                        {exam.subject || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('exams.batch')}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {exam.batch?.name || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('exams.total_marks')}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {exam.total_marks}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('exams.passing_marks')}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {exam.passing_marks}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('exams.date')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('exams.date')}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {formatDate(exam.date)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('exams.notes')}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {exam.notes || '-'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                        <CardTitle>
                            {t('exams.results')} ({displayStudents.length})
                        </CardTitle>
                        <Button size="sm" onClick={saveResults}>
                            <Pencil className="mr-2 size-4" />
                            {t('actions.save')}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={displayStudents}
                            showPagination={false}
                            searchable
                            searchPlaceholder={t('exams.student') + '...'}
                            emptyMessage={t('exams.no_students')}
                            getRowId={(row) => String(row.id)}
                        />
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog}
                onOpenChange={setDeleteDialog}
                title={t('confirm.are_you_sure')}
                description={t('exams.delete_confirm')}
                confirmText={t('confirm.delete')}
                cancelText={t('actions.cancel')}
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

ExamsShow.layout = {
    breadcrumbs: [
        { title: 'Exams', href: exams.index() },
        { title: 'View', href: '#' },
    ],
};
