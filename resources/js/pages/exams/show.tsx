import { Head, router, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import InputError from '@/components/input-error';
import exams from '@/routes/exams';
import { useLocale } from '@/contexts/locale-context';
import { useState } from 'react';
import { toast } from 'sonner';

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
    exam: Exam;
    students: Student[];
    enrolledStudentIds: number[];
};

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

export default function ExamsShow({ exam, students, enrolledStudentIds }: PageProps) {
    const { t } = useLocale();
    const [results, setResults] = useState<Record<number, { marks: string; notes: string }>>(() => {
        const map: Record<number, { marks: string; notes: string }> = {};
        exam.results.forEach((r) => {
            map[r.student_id] = { marks: String(r.marks_obtained), notes: r.notes || '' };
        });
        return map;
    });

    const displayStudents = enrolledStudentIds.length > 0
        ? students.filter((s) => enrolledStudentIds.includes(s.id))
        : students;

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

        router.post(exams.results.store(exam.id), { results: payload }, {
            preserveScroll: true,
            onSuccess: () => toast.success(t('exams.results_saved')),
        });
    };

    return (
        <>
            <Head title={exam.title} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={exams.index()}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 size-4" />
                            {t('actions.back')}
                        </Button>
                    </Link>
                    <Heading title={exam.title} description={exam.subject || ''} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">{t('exams.batch')}</div>
                            <div className="text-lg font-semibold">{exam.batch?.name || '-'}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">{t('exams.date')}</div>
                            <div className="text-lg font-semibold">{formatDate(exam.date)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">{t('exams.total_marks')}</div>
                            <div className="text-lg font-semibold">{exam.total_marks}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">{t('exams.passing_marks')}</div>
                            <div className="text-lg font-semibold">{exam.passing_marks}</div>
                        </CardContent>
                    </Card>
                </div>

                {exam.notes && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">{t('exams.notes')}</div>
                            <div className="mt-1">{exam.notes}</div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{t('exams.results')}</CardTitle>
                        <Button size="sm" onClick={saveResults}>
                            <Save className="mr-2 size-4" />
                            {t('actions.save')}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="sticky left-0 z-10 min-w-[150px] bg-background">{t('exams.student')}</TableHead>
                                    <TableHead>{t('exams.marks_obtained')}</TableHead>
                                    <TableHead>{t('exams.status')}</TableHead>
                                    <TableHead>{t('exams.notes')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            {t('exams.no_students')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    displayStudents.map((student) => {
                                        const obtained = Number(results[student.id]?.marks || 0);
                                        const passed = obtained >= exam.passing_marks;
                                        const hasResult = results[student.id]?.marks !== undefined && results[student.id]?.marks !== '';

                                        return (
                                            <TableRow key={student.id}>
                                                <TableCell className="sticky left-0 z-10 min-w-[150px] bg-background font-medium whitespace-nowrap">
                                                    {student.name}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max={exam.total_marks}
                                                        className="w-24"
                                                        value={results[student.id]?.marks || ''}
                                                        onChange={(e) => handleMarksChange(student.id, e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    {hasResult && (
                                                        <Badge className={passed ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                                                            {passed ? t('exams.pass') : t('exams.fail')}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    <Input
                                                        className="w-48"
                                                        placeholder={t('exams.notes_placeholder')}
                                                        value={results[student.id]?.notes || ''}
                                                        onChange={(e) => handleNotesChange(student.id, e.target.value)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ExamsShow.layout = {
    breadcrumbs: [
        { title: 'Exams', href: exams.index() },
        { title: 'Detail', href: '' },
    ],
};
