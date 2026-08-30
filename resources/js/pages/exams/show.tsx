import { Head, Link, router, usePage } from '@inertiajs/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ArrowLeft, Download, PenLine, Save, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import type { DataTableProps } from '@/components/data-table';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/contexts/locale-context';
import { isOwner } from '@/lib/role';
import exams from '@/routes/exams';

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
    tenant: { primary_color: string } | null;
};

type ExamsShowProps = {
    exam: Exam;
    students: Student[];
    enrolledStudentIds: number[];
};

function formatDate(dateStr: string | null): string {
    if (!dateStr) {
        return '-';
    }

    const d = new Date(dateStr);

    return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function hexToRGB(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (result) {
        return [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
        ];
    }

    return [99, 102, 241];
}

function generatePDF(
    exam: Exam,
    displayStudents: Student[],
    results: Record<number, { marks: string; notes: string }>,
    t: (key: string) => string,
    primaryColor: string,
    centerName: string,
) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const [pr, pg, pb] = hexToRGB(primaryColor);

    // Header
    doc.setFillColor(pr, pg, pb);
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setFillColor(pr, pg, pb);
    doc.rect(0, 45, pageWidth, 1, 'F');

    // Center name
    if (centerName) {
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(centerName.toUpperCase(), 14, 10);
    }

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(exam.title, 14, 20);

    // Subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const subtitle = [
        exam.subject && `Subject: ${exam.subject}`,
        exam.batch?.name && `Batch: ${exam.batch.name}`,
        exam.date && `Date: ${formatDate(exam.date)}`,
    ]
        .filter(Boolean)
        .join('  |  ');
    doc.text(subtitle, 14, 28);

    doc.setFontSize(9);
    doc.text(
        `Total: ${exam.total_marks}  |  Passing: ${exam.passing_marks}`,
        14,
        35,
    );

    doc.text(
        `Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
        14,
        41,
    );

    // Stats
    const resultsData = displayStudents.map((s) => {
        const obtained = Number(results[s.id]?.marks || 0);
        const hasResult =
            results[s.id]?.marks !== undefined && results[s.id]?.marks !== '';
        const passed = obtained >= exam.passing_marks;

        return { student: s, obtained, hasResult, passed };
    });

    const totalStudents = displayStudents.length;
    const graded = resultsData.filter((r) => r.hasResult).length;
    const passed = resultsData.filter((r) => r.passed && r.hasResult).length;
    const failed = graded - passed;
    const avg =
        graded > 0
            ? (
                  resultsData.reduce((sum, r) => sum + r.obtained, 0) / graded
              ).toFixed(1)
            : '-';

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const statsY = 53;
    doc.text(`Students: ${totalStudents}`, 14, statsY);
    doc.text(`Graded: ${graded}`, 60, statsY);
    doc.text(`Passed: ${passed}`, 100, statsY);
    doc.text(`Failed: ${failed}`, 135, statsY);
    doc.text(`Average: ${avg}`, 165, statsY);

    // Table
    const tableBody = resultsData.map((r, i) => [
        i + 1,
        r.student.name,
        r.hasResult ? String(r.obtained) : '-',
        r.hasResult ? (r.passed ? t('exams.pass') : t('exams.fail')) : '-',
        results[r.student.id]?.notes || '-',
    ]);

    autoTable(doc, {
        startY: statsY + 6,
        head: [
            [
                '#',
                t('exams.student'),
                t('exams.marks_obtained'),
                t('exams.status'),
                t('exams.notes'),
            ],
        ],
        body: tableBody,
        styles: {
            fontSize: 9,
            cellPadding: 4,
            textColor: [30, 41, 59],
            lineColor: [226, 232, 240],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: [pr, pg, pb],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        columnStyles: {
            0: { cellWidth: 12, halign: 'center' },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 20, halign: 'center' },
        },
        margin: { left: 14, right: 14 },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Footer line
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

        // Page number
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, {
            align: 'center',
        });

        // Center name in footer
        if (centerName) {
            doc.text(centerName, 14, pageHeight - 10);
        }
    }

    doc.save(`${exam.title.replace(/\s+/g, '_')}_results.pdf`);
}

export default function ExamsShow({
    exam,
    students,
    enrolledStudentIds,
}: ExamsShowProps) {
    const { t } = useLocale();
    const { auth, tenant } = usePage<PageProps>().props;
    const primaryColor = tenant?.primary_color || '#6366f1';
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
            .filter(([, v]) => v.marks !== '')
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

    const handleDownloadPDF = () => {
        generatePDF(
            exam,
            displayStudents,
            results,
            t,
            primaryColor,
            tenant?.name || '',
        );
    };

    const columns = useMemo(() => {
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
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
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
    }, [exam, results, t]);

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
                                <Button variant="outline" className="h-9">
                                    <PenLine className="size-4" />
                                    <span className="ml-2 hidden sm:inline">
                                        {t('actions.edit')}
                                    </span>
                                </Button>
                            </Link>
                            <Button
                                variant="destructive"
                                className="h-9"
                                onClick={handleDelete}
                            >
                                <Trash2 className="size-4" />
                                <span className="ml-2 hidden sm:inline">
                                    {t('actions.delete')}
                                </span>
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
                    <CardHeader>
                        <CardTitle>
                            {t('exams.results')} ({displayStudents.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={displayStudents}
                            searchable
                            searchPlaceholder={t('exams.student') + '...'}
                            emptyMessage={t('exams.no_students')}
                            getRowId={(row) => String(row.id)}
                            toolbarEnd={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 shrink-0 gap-1 px-2.5 sm:gap-2 sm:px-3"
                                    onClick={handleDownloadPDF}
                                >
                                    <Download className="size-4" />
                                    <span className="ml-2 hidden sm:inline">
                                        PDF
                                    </span>
                                </Button>
                            }
                        />
                        <div className="-mt-4 flex justify-end">
                            <Button onClick={saveResults}>
                                <Save className="mr-2 size-4" />
                                {t('actions.save')}
                            </Button>
                        </div>
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
