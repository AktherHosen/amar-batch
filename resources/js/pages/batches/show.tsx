import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { isOwner, isStaff } from '@/lib/role';
import { ArrowLeft, EllipsisVertical, Pencil, Trash2, UserMinus } from 'lucide-react';
import Heading from '@/components/heading';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, type DataTableProps } from '@/components/data-table';
import { SearchableSelect } from '@/components/ui/searchable-select';
import batches from '@/routes/batches';
import studentsRoutes from '@/routes/students';
import { useLocale } from '@/contexts/locale-context';

type PageProps = {
    auth: { user: { role: string } };
};

type Teacher = {
    id: number;
    name: string;
    email: string;
};

type Student = {
    id: number;
    name: string;
    coaching_class: { id: number; name: string } | null;
    joined_at: string | null;
};

type Enrollment = {
    id: number;
    student: Student;
    status: string;
    enrolled_at: string;
};

type BatchHistory = {
    id: number;
    student: Student | null;
    user: { name: string } | null;
    action: string;
    action_date: string | null;
    notes: string | null;
    created_at: string;
};

type Batch = {
    id: number;
    name: string;
    subject: string | null;
    days: string | null;
    time: string | null;
    capacity: number;
    start_date: string | null;
    end_date: string | null;
    status: string;
    enrollments: Enrollment[];
    teachers: Teacher[];
    history: BatchHistory[];
};

type BatchesShowProps = {
    batch: Batch;
    teachers: Teacher[];
    students: Student[];
    enrolledStudentIds: number[];
};

export default function BatchesShow({
    batch,
    teachers,
    students,
    enrolledStudentIds,
}: BatchesShowProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const isAdmin = isOwner(auth.user);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [enrollmentDate, setEnrollmentDate] = useState(new Date().toISOString().split('T')[0]);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [removeTeacherDialog, setRemoveTeacherDialog] = useState<{ open: boolean; teacherId: number | null }>({ open: false, teacherId: null });
    const [unenrollDialog, setUnenrollDialog] = useState<{ open: boolean; enrollmentId: number | null }>({ open: false, enrollmentId: null });

    const handleDelete = () => {
        setDeleteDialog(true);
    };

    const confirmDelete = () => {
        router.delete(batches.destroy(batch.id), {
            onSuccess: () => toast.success(t('toast.deleted_successfully')),
        });
        setDeleteDialog(false);
    };

    const handleAssignTeacher = () => {
        if (!selectedTeacher) {
            return;
        }

        router.post(
            batches.assignTeacher(batch.id),
            { teacher_id: parseInt(selectedTeacher) },
            {
                preserveScroll: true,
                onSuccess: () => setSelectedTeacher(''),
            },
        );
    };

    const handleRemoveTeacher = (teacherId: number) => {
        setRemoveTeacherDialog({ open: true, teacherId });
    };

    const confirmRemoveTeacher = () => {
        if (removeTeacherDialog.teacherId) {
            router.delete(batches.removeTeacher(batch.id), {
                data: { teacher_id: removeTeacherDialog.teacherId },
                preserveScroll: true,
                onSuccess: () => toast.success(t('toast.removed_successfully')),
            });
        }
        setRemoveTeacherDialog({ open: false, teacherId: null });
    };

    const handleEnrollStudent = () => {
        if (!selectedStudent) {
            return;
        }

        router.post(
            `/batches/${batch.id}/enroll`,
            { student_id: parseInt(selectedStudent), enrolled_at: enrollmentDate },
            {
                preserveScroll: true,
                only: ['batch', 'enrolledStudentIds'],
                onSuccess: () => {
                    setSelectedStudent('');
                    setEnrollmentDate(new Date().toISOString().split('T')[0]);
                },
            },
        );
    };

    const handleUpdateEnrollmentStatus = (
        enrollmentId: number,
        status: string,
    ) => {
        router.put(
            `/enrollments/${enrollmentId}`,
            { status },
            {
                preserveScroll: true,
            },
        );
    };

    const handleUnenroll = (enrollmentId: number) => {
        setUnenrollDialog({ open: true, enrollmentId });
    };

    const confirmUnenroll = () => {
        if (unenrollDialog.enrollmentId) {
            router.delete(`/enrollments/${unenrollDialog.enrollmentId}`, {
                preserveScroll: true,
                onSuccess: () => toast.success(t('toast.unenrolled_successfully')),
            });
        }
        setUnenrollDialog({ open: false, enrollmentId: null });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            'default' | 'secondary' | 'destructive' | 'success' | 'danger'
        > = {
            active: 'default',
            completed: 'success',
            dropped: 'danger',
        };

        return variants[status] || 'secondary';
    };

    const availableTeachers = teachers.filter(
        (t) => !batch.teachers.some((bt) => bt.id === t.id),
    );

    const teacherColumns = (() => {
        type Col = NonNullable<DataTableProps<Teacher, unknown>['columns']>[number];
        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: t('teachers.name'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">{row.original.name}</span>
                ),
            } as Col,
            {
                id: 'email',
                accessorKey: 'email',
                header: t('teachers.email'),
                enableSorting: true,
                cell: ({ row }: any) => <span>{row.original.email}</span>,
            } as Col,
            {
                id: 'actions',
                header: '',
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }: any) => {
                    const teacher: Teacher = row.original;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="size-8 p-0">
                                    <EllipsisVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleRemoveTeacher(teacher.id)} className="text-destructive">
                                    <UserMinus className="mr-2 size-4" />
                                    {t('batches.remove')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            } as Col,
        ];
    })();

    const enrollmentColumns = (() => {
        type Col = NonNullable<DataTableProps<Enrollment, unknown>['columns']>[number];
        return [
            {
                id: 'student',
                accessorKey: 'student.name',
                header: t('students.name'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => {
                    const enrollment: Enrollment = row.original;
                    return (
                        <Link href={studentsRoutes.show(enrollment.student.id)} className="hover:underline">
                            <span className="font-medium">{enrollment.student.name}</span>
                        </Link>
                    );
                },
            } as Col,
            {
                id: 'class',
                accessorKey: 'student.coaching_class.name',
                header: t('students.class'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const enrollment: Enrollment = row.original;
                    return enrollment.student.coaching_class?.name || '-';
                },
            } as Col,
            {
                id: 'enrolled_at',
                accessorKey: 'enrolled_at',
                header: t('batches.enrolled_at'),
                enableSorting: true,
                cell: ({ row }: any) => {
                    const enrollment: Enrollment = row.original;
                    return new Date(enrollment.enrolled_at).toLocaleDateString();
                },
            } as Col,
            {
                id: 'joined_at',
                accessorKey: 'student.joined_at',
                header: t('students.joined_at'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const enrollment: Enrollment = row.original;
                    return enrollment.student.joined_at
                        ? new Date(enrollment.student.joined_at).toLocaleDateString()
                        : '-';
                },
            } as Col,
            {
                id: 'status',
                accessorKey: 'status',
                header: t('students.status'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const enrollment: Enrollment = row.original;
                    return <Badge variant={getStatusBadge(enrollment.status)}>{enrollment.status}</Badge>;
                },
            } as Col,
            {
                id: 'actions',
                header: '',
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }: any) => {
                    const enrollment: Enrollment = row.original;
                    if (!(isAdmin || (auth.user.role as string) === 'teacher')) {
                        return null;
                    }
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="size-8 p-0">
                                    <EllipsisVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {enrollment.status === 'active' && (
                                    <>
                                        <DropdownMenuItem onClick={() => handleUpdateEnrollmentStatus(enrollment.id, 'completed')}>
                                            {t('actions.complete')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleUpdateEnrollmentStatus(enrollment.id, 'dropped')}>
                                            {t('batches.drop')}
                                        </DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuItem onClick={() => handleUnenroll(enrollment.id)} className="text-destructive">
                                    <UserMinus className="mr-2 size-4" />
                                    {t('batches.unenroll')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            } as Col,
        ];
    })();

    const historyColumns = (() => {
        type Col = NonNullable<DataTableProps<BatchHistory, unknown>['columns']>[number];
        return [
            {
                id: 'date',
                accessorKey: 'action_date',
                header: t('batches.date'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => {
                    const item: BatchHistory = row.original;
                    return item.action_date
                        ? new Date(item.action_date).toLocaleDateString()
                        : new Date(item.created_at).toLocaleDateString();
                },
            } as Col,
            {
                id: 'student',
                accessorKey: 'student.name',
                header: t('batches.student'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const item: BatchHistory = row.original;
                    return <span className="font-medium">{item.student?.name}</span>;
                },
            } as Col,
            {
                id: 'action',
                accessorKey: 'action',
                header: t('batches.action'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const item: BatchHistory = row.original;
                    return (
                        <Badge
                            variant={
                                item.action === 'enrolled' ? 'default' :
                                item.action === 'completed' ? 'success' :
                                'danger'
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
                cell: ({ row }: any) => {
                    const item: BatchHistory = row.original;
                    return item.user?.name;
                },
            } as Col,
        ];
    })();

    return (
        <>
            <Head title={batch.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <Link href={batches.index()} className="shrink-0">
                            <Button variant="ghost" size="icon" className="size-9">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <h1 className="truncate text-lg font-bold tracking-tight sm:text-2xl">{batch.name}</h1>
                    </div>
                    {isAdmin && batch.status !== 'completed' && (
                        <div className="flex gap-2 shrink-0">
                            <Link href={batches.edit(batch.id)}>
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
                            <CardTitle>{t('batches.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('batches.name')}
                                    </p>
                                    <p className="text-sm font-medium">{batch.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('batches.subject')}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {batch.subject || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('batches.capacity')}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">{batch.capacity}</p>
                                        {batch.enrollments.length >= batch.capacity && (
                                            <Badge variant="destructive" className="text-xs">{t('batches.full')}</Badge>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('batches.enrolled')}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">
                                            {batch.enrollments.length}/{batch.capacity}
                                        </p>
                                        <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={`h-full rounded-full ${
                                                    batch.enrollments.length >= batch.capacity
                                                        ? 'bg-red-500'
                                                        : batch.enrollments.length >= batch.capacity * 0.8
                                                          ? 'bg-yellow-500'
                                                          : 'bg-green-500'
                                                }`}
                                                style={{
                                                    width: `${Math.min((batch.enrollments.length / batch.capacity) * 100, 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('students.status')}
                                    </p>
                                    <Badge variant={getStatusBadge(batch.status)}>
                                        {batch.status}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('batches.schedule')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('batches.schedule')}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {batch.days || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Time
                                    </p>
                                    <p className="text-sm font-medium">
                                        {batch.time || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Start Date
                                    </p>
                                    <p className="text-sm font-medium">
                                        {batch.start_date
                                            ? new Date(
                                                  batch.start_date,
                                              ).toLocaleDateString()
                                            : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        End Date
                                    </p>
                                    <p className="text-sm font-medium">
                                        {batch.end_date
                                            ? new Date(
                                                  batch.end_date,
                                              ).toLocaleDateString()
                                            : '-'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {(isAdmin || isStaff(auth.user)) && batch.status !== 'completed' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('batches.manage')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                {isAdmin && (
                                    <div className="space-y-3">
                                        <p className="text-sm">
                                            {t('teachers.title')}
                                        </p>
                                        {availableTeachers.length > 0 ? (
                                            <div className="flex flex-col gap-2">
                                                <SearchableSelect
                                                    options={availableTeachers.map((teacher) => ({
                                                        value: String(teacher.id),
                                                        label: `${teacher.name} (${teacher.email})`,
                                                        searchText: `${teacher.name} ${teacher.email}`,
                                                    }))}
                                                    value={selectedTeacher}
                                                    onValueChange={setSelectedTeacher}
                                                    placeholder={t('batches.select_teacher')}
                                                    emptyText={t('batches.no_teachers')}
                                                    noResultsText={t('batches.no_teachers')}
                                                    className="w-full"
                                                />
                                                <Button
                                                    onClick={handleAssignTeacher}
                                                    disabled={!selectedTeacher}
                                                >
                                                    {t('batches.assign')}
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                {t('batches.no_teachers')}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {(() => {
                                    const availableStudents = students.filter(
                                        (s) =>
                                            !enrolledStudentIds.includes(s.id),
                                    );

                                    return (
                                        <div className="space-y-3">
                                            <p className="text-sm ">
                                                {t('students.title')}
                                            </p>
                                            {availableStudents.length > 0 ? (
                                                <div className="flex flex-col gap-2">
                                                    <SearchableSelect
                                                        options={availableStudents.map((student) => ({
                                                            value: String(student.id),
                                                            label: `${student.name} (${student.coaching_class?.name || t('batches.no_class')})`,
                                                            searchText: student.name,
                                                        }))}
                                                        value={selectedStudent}
                                                        onValueChange={setSelectedStudent}
                                                        placeholder={t('batches.select_student')}
                                                        emptyText={t('batches.no_teachers')}
                                                        noResultsText={t('batches.no_teachers')}
                                                        className="w-full"
                                                    />
                                                    <div className="flex flex-col gap-2 sm:flex-row">
                                                        <DatePicker
                                                            value={enrollmentDate}
                                                            onValueChange={(value) => setEnrollmentDate(value)}
                                                            placeholder={t('batches.enroll_date')}
                                                        />
                                                        <Button
                                                            onClick={
                                                                handleEnrollStudent
                                                            }
                                                            disabled={!selectedStudent}
                                                        >
                                                            {t('batches.enroll')}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    {t('batches.enrolled')}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {isAdmin && batch.teachers.length > 0 && batch.status !== 'completed' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('batches.assigned_teachers')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={teacherColumns}
                                data={batch.teachers}
                                showPagination={false}
                                searchable
                                searchPlaceholder={t('teachers.title') + '...'}
                                emptyMessage={t('teachers.title')}
                                getRowId={(row) => String(row.id)}
                            />
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {t('batches.enrolled')} ({batch.enrollments.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={enrollmentColumns}
                            data={batch.enrollments}
                            showPagination={false}
                            searchable
                            searchPlaceholder={t('students.name') + '...'}
                            emptyMessage={t('batches.enrolled')}
                            getRowId={(row) => String(row.id)}
                        />
                    </CardContent>
                </Card>

                {batch.history && batch.history.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={historyColumns}
                                data={batch.history}
                                showPagination={false}
                                searchable
                                searchPlaceholder={t('actions.search') + '...'}
                                emptyMessage="No history records"
                                getRowId={(row) => String(row.id)}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>

            <ConfirmDialog
                open={deleteDialog}
                onOpenChange={setDeleteDialog}
                title={t('batches.delete_title')}
                description={t('batches.delete_confirm').replace('{name}', batch.name)}
                confirmText={t('actions.delete')}
                cancelText={t('actions.cancel')}
                variant="destructive"
                onConfirm={confirmDelete}
            />

            <ConfirmDialog
                open={removeTeacherDialog.open}
                onOpenChange={(open) => setRemoveTeacherDialog({ open, teacherId: null })}
                title={t('batches.remove_teacher_title')}
                description={t('batches.remove_teacher_confirm')}
                confirmText={t('batches.remove')}
                cancelText={t('actions.cancel')}
                variant="destructive"
                onConfirm={confirmRemoveTeacher}
            />

            <ConfirmDialog
                open={unenrollDialog.open}
                onOpenChange={(open) => setUnenrollDialog({ open, enrollmentId: null })}
                title={t('batches.unenroll_title')}
                description={t('batches.unenroll_confirm')}
                confirmText={t('batches.unenroll')}
                cancelText={t('actions.cancel')}
                variant="destructive"
                onConfirm={confirmUnenroll}
            />
        </>
    );
}

BatchesShow.layout = {
    breadcrumbs: [
        {
            title: 'Batches',
            href: batches.index(),
        },
        {
            title: 'View',
            href: '#',
        },
    ],
};
