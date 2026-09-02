import { Head, Link, router, usePage } from '@inertiajs/react';
import { EllipsisVertical, Eye, PenLine, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import type { DataTableProps } from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import Heading from '@/components/heading';
import PageActions from '@/components/page-actions';
import { RefreshButton } from '@/components/refresh-button';
import StudentForm from '@/components/student-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useLocale } from '@/contexts/locale-context';
import { isOwner } from '@/lib/role';
import students from '@/routes/students';
import type { Student } from '@/types';

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

type CoachingClass = {
    id: number;
    name: string;
};

type PageProps = {
    auth: { user: { role: string } };
    students: {
        data: Student[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    coachingClasses: CoachingClass[];
    existingParents?: Array<{ id: number; name: string; email: string }>;
    filters: {
        search?: string;
        status?: string;
    };
};

export default function StudentsIndex({
    students: pagination,
    coachingClasses,
    existingParents = [],
    filters,
}: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const isAdmin = isOwner(auth.user);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: Student | null;
    }>({ open: false, item: null });
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('create') === 'true') {
            setEditingStudent(null);
            setSheetOpen(true);
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            students.index(),
            { search: value, status },
            { preserveState: true },
        );
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get(
            students.index(),
            { search, status: value },
            { preserveState: true },
        );
    };

    const clearAll = () => {
        setSearch('');
        setStatus('');
        router.get(students.index(), {}, { preserveState: true });
    };

    const handleCreate = () => {
        setEditingStudent(null);
        setSheetOpen(true);
    };

    const handleEdit = (student: Student) => {
        setEditingStudent(student);
        setSheetOpen(true);
    };

    const handleDelete = (student: Student) => {
        setDeleteDialog({ open: true, item: student });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(students.destroy(deleteDialog.item.id));
            toast.success(t('toast.deleted_successfully'));
            setDeleteDialog({ open: false, item: null });
        }
    };

    const handleRowStatusChange = (student: Student, value: string) => {
        if (value === student.status) {
            return;
        }

        router.patch(
            students.status(student.id),
            { status: value },
            {
                preserveState: true,
                onSuccess: () => {
                    toast.success(t('toast.updated_successfully'));
                    router.reload({ only: ['students'] });
                },
            },
        );
    };

    const handleClassChange = (student: Student, classId: string) => {
        if (classId === String(student.coaching_class_id)) {
            return;
        }

        router.patch(
            `/students/${student.id}/coaching-class`,
            { coaching_class_id: classId },
            {
                preserveState: true,
                onSuccess: () => {
                    toast.success(t('toast.updated_successfully'));
                    router.reload({ only: ['students'] });
                },
            },
        );
    };

    const activeFilterCount = status ? 1 : 0;

    const columns = useMemo(() => {
        type Col = NonNullable<
            DataTableProps<Student, unknown>['columns']
        >[number];

        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: t('students.info'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => {
                    const s: Student = row.original;
                    const className = s.coaching_class
                        ? `${s.coaching_class.name}${s.section ? ` - ${s.section}` : ''}`
                        : s.section || '';

                    return (
                        <div className="min-w-0">
                            <Link
                                href={students.show(s.id)}
                                className="font-medium hover:underline"
                            >
                                {s.name}
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-mono">{s.code}</span>
                                {className && (
                                    <>
                                        <span className="text-muted-foreground/50">•</span>
                                        <span>{className}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                },
            } as Col,
            {
                id: 'phone',
                accessorKey: 'phone',
                header: t('students.phone'),
                enableSorting: false,
                cell: ({ row }: any) => row.original.phone || '-',
            } as Col,
            {
                id: 'coaching_class',
                accessorKey: 'coaching_class',
                header: t('students.class'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const s: Student = row.original;

                    if (!isAdmin) {
                        return (
                            <span className="text-sm">
                                {s.coaching_class?.name || '-'}
                            </span>
                        );
                    }

                    return (
                        <Select
                            value={String(s.coaching_class_id ?? '')}
                            onValueChange={(value) =>
                                handleClassChange(s, value)
                            }
                        >
                            <SelectTrigger className="h-8 w-auto min-w-[8rem]">
                                <SelectValue placeholder={t('students.class')} />
                            </SelectTrigger>
                            <SelectContent>
                                {coachingClasses.map((cls) => (
                                    <SelectItem
                                        key={cls.id}
                                        value={String(cls.id)}
                                    >
                                        {cls.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    );
                },
            } as Col,
            {
                id: 'status',
                accessorKey: 'status',
                header: t('students.status'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const s: Student = row.original;

                    if (!isAdmin) {
                        return (
                            <Badge
                                variant={
                                    s.status === 'active' ? 'default' : s.status === 'paused' ? 'warning' : 'danger'
                                }
                            >
                                {s.status}
                            </Badge>
                        );
                    }

                    return (
                        <Select
                            value={s.status}
                            onValueChange={(value) =>
                                handleRowStatusChange(s, value)
                            }
                        >
                            <SelectTrigger className="h-8 w-auto min-w-[7rem]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">
                                    <span className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-green-600" />
                                        {t('students.active')}
                                    </span>
                                </SelectItem>
                                <SelectItem value="paused">
                                    <span className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-yellow-500" />
                                        {t('students.paused')}
                                    </span>
                                </SelectItem>
                                <SelectItem value="inactive">
                                    <span className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-red-600" />
                                        {t('students.inactive')}
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    );
                },
            } as Col,
            {
                id: 'actions',
                header: '',
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }: any) => {
                    const s: Student = row.original;

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="size-8 p-0"
                                >
                                    <EllipsisVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={students.show(s.id)}>
                                        <Eye className="mr-2 size-4" />
                                        {t('actions.view')}
                                    </Link>
                                </DropdownMenuItem>
                                {isAdmin && (
                                    <>
                                        <DropdownMenuItem onClick={() => handleEdit(s)}>
                                                <PenLine className="mr-2 size-4" />
                                                {t('actions.edit')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleDelete(s)}
                                            className="text-destructive"
                                        >
                                            <Trash2 className="mr-2 size-4" />
                                            {t('actions.delete')}
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            } as Col,
        ];
    }, [t, isAdmin]);

    return (
        <>
            <Head title={t('students.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title={t('students.title')}
                        description={t('students.desc')}
                    />
                    <div className="flex items-center gap-1">
                        <RefreshButton
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                router.reload({
                                    only: ['students'],
                                    onFinish: () => setRefreshing(false),
                                });
                            }}
                        />
                        <PageActions
                            isAdmin={isAdmin}
                            createLabel={t('students.create')}
                            onCreate={handleCreate}
                            exportTitle={t('students.title')}
                            exportFilename="students"
                            exportHeaders={[
                                t('students.student_id'),
                                t('students.name'),
                                t('students.phone'),
                                t('students.class'),
                                t('students.joined_at'),
                                t('students.status'),
                            ]}
                            exportRows={pagination.data.map((s) => [
                                s.code,
                                s.name,
                                s.phone || '',
                                s.coaching_class?.name || '',
                                s.joined_at ? formatDate(s.joined_at) : '',
                                s.status,
                            ])}
                            importUrl="/students/import"
                            importFields={[
                                'name',
                                'phone',
                                'coaching_class',
                                'section',
                                'gender',
                                'date_of_birth',
                                'joined_at',
                            ]}
                            onImportSuccess={() =>
                                router.reload({ only: ['students'] })
                            }
                        />
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <DataTable
                            columns={columns}
                            data={pagination.data}
                            loading={refreshing}
                            currentPage={pagination.current_page}
                            lastPage={pagination.last_page}
                            total={pagination.total}
                            itemName={t('students.title').toLowerCase()}
                            baseUrl={students.index().url}
                            preserveParams={{ search, status }}
                            emptyMessage="No students found"
                            getRowId={(row) => String(row.id)}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder={
                                        t('actions.search') + '...'
                                    }
                                    searchValue={search}
                                    onSearchChange={handleSearch}
                                    activeFilterCount={activeFilterCount}
                                    onClearAll={clearAll}
                                    filters={[
                                        {
                                            id: 'status',
                                            placeholder: t(
                                                'students.all_status',
                                            ),
                                            value: status,
                                            options: [
                                                {
                                                    label: t('students.active'),
                                                    value: 'active',
                                                },
                                                {
                                                    label: t('students.paused'),
                                                    value: 'paused',
                                                },
                                                {
                                                    label: t(
                                                        'students.inactive',
                                                    ),
                                                    value: 'inactive',
                                                },
                                            ],
                                            onValueChange: handleStatusChange,
                                        },
                                    ]}
                                />
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {editingStudent ? t('actions.edit') : t('actions.create')}
                        </SheetTitle>
                        <SheetDescription>
                            {editingStudent
                                ? t('actions.update') + ' student information below.'
                                : 'Fill in the details to add a new student.'}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="px-4 pb-4">
                        <StudentForm
                            coachingClasses={coachingClasses}
                            existingParents={existingParents}
                            student={editingStudent ?? undefined}
                            onSubmit={(formData) => {
                                setProcessing(true);

                                if (editingStudent) {
                                    router.post(
                                        `/students/${editingStudent.id}`,
                                        {
                                            _method: 'put',
                                            ...Object.fromEntries(formData),
                                        },
                                        {
                                            forceFormData: true,
                                            onFinish: () => setProcessing(false),
                                            onSuccess: () => {
                                                setSheetOpen(false);
                                                toast.success(t('toast.updated_successfully'));
                                                router.reload({ only: ['students', 'coachingClasses'] });
                                            },
                                        },
                                    );
                                } else {
                                    router.post('/students', formData, {
                                        forceFormData: true,
                                        onFinish: () => setProcessing(false),
                                        onSuccess: () => {
                                            setSheetOpen(false);
                                            toast.success(t('toast.created_successfully'));
                                            router.reload({ only: ['students', 'coachingClasses'] });
                                        },
                                    });
                                }
                            }}
                            processing={processing}
                            errors={usePage<PageProps>().props.errors as Record<string, string>}
                            hideActions
                        />
                    </div>
                    <SheetFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSheetOpen(false)}
                        >
                            {t('actions.cancel')}
                        </Button>
                        <Button type="submit" form="student-form" disabled={processing}>
                            {processing
                                ? editingStudent
                                    ? t('actions.updating')
                                    : t('actions.creating')
                                : editingStudent
                                  ? t('actions.update')
                                  : t('actions.create')}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

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

StudentsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Students',
            href: students.index(),
        },
    ],
};
