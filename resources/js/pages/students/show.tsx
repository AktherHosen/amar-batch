import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import type { Student } from '@/types';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import students from '@/routes/students';
import { useLocale } from '@/contexts/locale-context';

type PageProps = {
    auth: { user: { role: string } };
};

type StudentsShowProps = {
    student: Student;
    attendanceSummary: Record<number, Record<number, Record<string, number>>>;
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
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';
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
            toast.success('Student deleted successfully');
            setDeleteDialog({ open: false, item: null });
        }
    };

    return (
        <>
            <Head title={student.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href={students.index()}>
                            <Button variant="ghost" size="icon" className="size-9">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <h1 className="text-lg font-bold tracking-tight sm:text-2xl">{student.name}</h1>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-2">
                            <Link href={students.edit(student.id)}>
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
                            <CardTitle>{t('students.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('students.name')}
                                    </p>
                                    <p className="text-sm font-medium">{student.name}</p>
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
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('students.status')}
                                    </p>
                                    <Badge
                                        variant={
                                            student.status === 'active'
                                                ? 'default'
                                                : 'warning'
                                        }
                                    >
                                        {student.status}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {t('students.guardian_name')} &{' '}
                                {t('students.address')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <p className="text-xs text-muted-foreground">
                                        {t('students.address')}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {student.address || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('students.guardian_name')}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {student.guardian_name || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('students.guardian_phone')}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {student.guardian_phone || '-'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {student.enrollments && student.enrollments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('students.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            {t('batches.name')}
                                        </TableHead>
                                        <TableHead>
                                            {t('batches.subject')}
                                        </TableHead>
                                        <TableHead>
                                            {t('students.joined_at')}
                                        </TableHead>
                                        <TableHead>
                                            {t('students.status')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {student.enrollments.map((enrollment) => (
                                        <TableRow key={enrollment.id}>
                                            <TableCell className="font-medium">
                                                {enrollment.batch?.name}
                                            </TableCell>
                                            <TableCell>
                                                {enrollment.batch?.subject ||
                                                    '-'}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(
                                                    enrollment.enrolled_at,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        enrollment.status ===
                                                        'active'
                                                            ? 'default'
                                                            : enrollment.status ===
                                                                'completed'
                                                              ? 'secondary'
                                                              : 'destructive'
                                                    }
                                                >
                                                    {enrollment.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>{t('attendance.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {Object.keys(attendanceSummary).length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('fees.month')}</TableHead>
                                        <TableHead>{t('fees.year')}</TableHead>
                                        <TableHead className="text-center">
                                            {t('attendance.present')}
                                        </TableHead>
                                        <TableHead className="text-center">
                                            {t('attendance.absent')}
                                        </TableHead>
                                        <TableHead className="text-center">
                                            {t('attendance.late')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(attendanceSummary)
                                        .sort(
                                            ([a], [b]) => Number(b) - Number(a),
                                        )
                                        .flatMap(([year, months]) =>
                                            Object.entries(months)
                                                .sort(
                                                    ([a], [b]) =>
                                                        Number(b) - Number(a),
                                                )
                                                .map(([month, counts]) => (
                                                    <TableRow
                                                        key={`${year}-${month}`}
                                                    >
                                                        <TableCell className="font-medium">
                                                            {
                                                                MONTH_NAMES[
                                                                    Number(
                                                                        month,
                                                                    )
                                                                ]
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {year}
                                                        </TableCell>
                                                        <TableCell className="text-center text-green-600">
                                                            {counts.present ||
                                                                0}
                                                        </TableCell>
                                                        <TableCell className="text-center text-red-600">
                                                            {counts.absent || 0}
                                                        </TableCell>
                                                        <TableCell className="text-center text-yellow-600">
                                                            {counts.late || 0}
                                                        </TableCell>
                                                    </TableRow>
                                                )),
                                        )}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                No attendance records yet.
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>{t('fees.payment_history')}</CardTitle>
                            {student.fee_statuses &&
                                student.fee_statuses.length > 0 && (
                                    <div className="text-sm text-muted-foreground">
                                        Total Paid:{' '}
                                        <span className="font-bold text-green-600">
                                            {student.fee_statuses
                                                .reduce(
                                                    (sum, f) =>
                                                        sum +
                                                        Number(f.amount_paid),
                                                    0,
                                                )
                                                .toFixed(0)}
                                        </span>
                                    </div>
                                )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {student.fee_statuses &&
                        student.fee_statuses.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('fees.month')}</TableHead>
                                        <TableHead>{t('fees.year')}</TableHead>
                                        <TableHead>
                                            {t('batches.name')}
                                        </TableHead>
                                        <TableHead className="text-right">
                                            {t('fees.amount_paid')}
                                        </TableHead>
                                        <TableHead>
                                            {t('attendance.notes')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {student.fee_statuses
                                        .sort(
                                            (a, b) =>
                                                b.year - a.year ||
                                                b.month - a.month,
                                        )
                                        .map((fee) => (
                                            <TableRow key={fee.id}>
                                                <TableCell className="font-medium">
                                                    {MONTH_NAMES[fee.month]}
                                                </TableCell>
                                                <TableCell>
                                                    {fee.year}
                                                </TableCell>
                                                <TableCell>
                                                    {fee.batch?.name || '-'}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {Number(
                                                        fee.amount_paid,
                                                    ).toFixed(0)}
                                                </TableCell>
                                                <TableCell>
                                                    {fee.notes || '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                No payment records yet.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    setDeleteDialog({ open, item: deleteDialog.item })
                }
                title="Delete Student"
                description={`Are you sure you want to delete ${deleteDialog.item?.name}?`}
                confirmText="Delete"
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
