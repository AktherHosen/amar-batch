import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Download,
    EllipsisVertical,
    Layers,
    PenLine,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable  } from '@/components/data-table';
import type { DataTableProps } from '@/components/data-table';
import TeacherForm from '@/components/teacher-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { generateTablePDF } from '@/lib/pdf-table';
import { isOwner } from '@/lib/role';
import batches from '@/routes/batches';
import teachers from '@/routes/teachers';

type PageProps = {
    auth: { user: { role: string } };
    tenant: { primary_color: string; name: string } | null;
    errors: Record<string, string>;
};

type Batch = {
    id: number;
    name: string;
    subject: string | null;
    enrollments_count: number;
    status: string;
};

type Role = { id: number; name: string; slug: string };
type Branch = { id: number; name: string };

type Teacher = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    role: string;
    is_approved: boolean;
    created_at: string;
    assigned_batches: Batch[];
    assigned_batches_count: number;
};

type TeachersShowProps = {
    teacher: Teacher;
    stats: {
        active_batches: number;
        total_students: number;
    };
    roles: Role[];
    branches: Branch[];
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

export default function TeachersShow({ teacher, stats, roles, branches }: TeachersShowProps) {
    const { t } = useLocale();
    const { auth, tenant, errors: pageErrors } = usePage<PageProps>().props;
    const primaryColor = tenant?.primary_color || '#6366f1';
    const isAdmin = isOwner(auth.user);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        setDeleteDialog(true);
    };

    const confirmDelete = () => {
        router.delete(teachers.destroy(teacher.id));
        toast.success(t('toast.deactivated_successfully'));
        setDeleteDialog(false);
    };

    const handleEditSubmit = (data: FormData) => {
        data.append('_method', 'PUT');
        setProcessing(true);
        router.post(teachers.update(teacher.id), data, {
            preserveScroll: true,
            onSuccess: () => {
                setEditOpen(false);
                setProcessing(false);
            },
            onError: () => {
                setProcessing(false);
            },
        });
    };

    const columns = (() => {
        type Col = NonNullable<
            DataTableProps<Batch, unknown>['columns']
        >[number];

        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: t('batches.name'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">{row.original.name}</span>
                ),
            } as Col,
            {
                id: 'subject',
                accessorKey: 'subject',
                header: t('batches.subject'),
                enableSorting: true,
                cell: ({ row }: any) => row.original.subject || '-',
            } as Col,
            {
                id: 'enrollments_count',
                accessorKey: 'enrollments_count',
                header: t('batches.enrolled'),
                enableSorting: false,
                cell: ({ row }: any) => (
                    <span>{row.original.enrollments_count}</span>
                ),
            } as Col,
            {
                id: 'status',
                accessorKey: 'status',
                header: t('students.status'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const batch: Batch = row.original;

                    return (
                        <Badge
                            variant={
                                batch.status === 'active'
                                    ? 'default'
                                    : batch.status === 'inactive'
                                      ? 'secondary'
                                      : 'destructive'
                            }
                        >
                            {batch.status}
                        </Badge>
                    );
                },
            } as Col,
            {
                id: 'actions',
                header: '',
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }: any) => {
                    const batch: Batch = row.original;

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
                                    <Link href={batches.show(batch.id)}>
                                        {t('actions.view')}
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            } as Col,
        ];
    })();

    return (
        <>
            <Head title={teacher.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex min-w-0 items-center justify-between">
                    <div className="flex min-w-0 items-center gap-2">
                        <Link href={teachers.index()} className="shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-9"
                            >
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <h1 className="truncate text-lg font-bold tracking-tight sm:text-2xl">
                            {teacher.name}
                        </h1>
                    </div>
                    {isAdmin && (
                        <div className="flex shrink-0 gap-2">
                            {/* Edit Sheet */}
                            <Sheet open={editOpen} onOpenChange={setEditOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="h-9">
                                        <PenLine className="size-4" />
                                        <span className="ml-2 hidden sm:inline">{t('actions.edit')}</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="sm:max-w-2xl overflow-y-auto">
                                    <SheetHeader>
                                        <SheetTitle>{t('actions.edit')} {teacher.name}</SheetTitle>
                                        <SheetDescription>
                                            {t('teachers.add_desc')}
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="px-4 pb-4">
                                        <TeacherForm
                                            teacher={teacher}
                                            roles={roles}
                                            branches={branches}
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
                                        <Button type="submit" form="teacher-form" disabled={processing}>
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

                <Card>
                    <CardHeader>
                        <CardTitle>{t('teachers.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center gap-4">
                            <Avatar className="size-16 sm:size-20">
                                <AvatarImage
                                    src={
                                        teacher.avatar
                                            ? `/storage/${teacher.avatar}`
                                            : undefined
                                    }
                                    alt={teacher.name}
                                />
                                <AvatarFallback className="text-xl">
                                    {teacher.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .toUpperCase()
                                        .slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="w-full space-y-3">
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                    <Badge
                                        variant={
                                            teacher.role === 'inactive'
                                                ? 'danger'
                                                : 'success'
                                        }
                                    >
                                        {teacher.role === 'inactive'
                                            ? t('teachers.inactive')
                                            : t('teachers.active')}
                                    </Badge>
                                    {teacher.role !== 'inactive' && (
                                        <Badge
                                            variant={
                                                teacher.is_approved
                                                    ? 'success'
                                                    : 'secondary'
                                            }
                                        >
                                            {teacher.is_approved
                                                ? t('teachers.approved')
                                                : t('teachers.pending')}
                                        </Badge>
                                    )}
                                </div>
                                <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">
                                            {t('teachers.name')}
                                        </p>
                                        <p className="truncate text-sm font-medium">
                                            {teacher.name}
                                        </p>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">
                                            {t('teachers.email')}
                                        </p>
                                        <p className="truncate text-sm font-medium">
                                            {teacher.email}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('teachers.phone')}
                                        </p>
                                        <p className="text-sm font-medium">
                                            {teacher.phone || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('teachers.role')}
                                        </p>
                                        <p className="text-sm font-medium capitalize">
                                            {teacher.role}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('teachers.joined')}
                                        </p>
                                        <p className="text-sm font-medium">
                                            {formatDate(teacher.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <Layers className="size-5 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="text-xl leading-none font-bold sm:text-2xl">
                                    {teacher.assigned_batches_count}
                                </p>
                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                    {t('batches.title')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <BookOpen className="size-5 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="text-xl leading-none font-bold sm:text-2xl">
                                    {stats.active_batches}
                                </p>
                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                    {t('batches.active')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <Users className="size-5 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="text-xl leading-none font-bold sm:text-2xl">
                                    {stats.total_students}
                                </p>
                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                    {t('students.title')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('batches.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={teacher.assigned_batches ?? []}
                            searchable
                            searchPlaceholder={t('batches.title') + '...'}
                            emptyMessage={t('batches.title')}
                            getRowId={(row) => String(row.id)}
                            toolbarEnd={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 shrink-0 gap-1 px-2.5 sm:gap-2 sm:px-3"
                                    onClick={() =>
                                        generateTablePDF({
                                            title: `${teacher.name} - ${t('batches.title')}`,
                                            headers: [
                                                t('batches.name'),
                                                t('batches.subject'),
                                                t('batches.enrolled'),
                                                t('students.status'),
                                            ],
                                            rows: (
                                                teacher.assigned_batches ?? []
                                            ).map((b) => [
                                                b.name,
                                                b.subject || '-',
                                                b.enrollments_count,
                                                b.status,
                                            ]),
                                            filename: `${teacher.name}_batches`,
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
                open={deleteDialog}
                onOpenChange={setDeleteDialog}
                title={t('teachers.deactivate_title')}
                description={t('teachers.deactivate_confirm').replace(
                    '{name}',
                    teacher.name,
                )}
                confirmText={t('teachers.deactivate')}
                cancelText={t('actions.cancel')}
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

TeachersShow.layout = {
    breadcrumbs: [
        {
            title: 'Teachers',
            href: teachers.index(),
        },
        {
            title: 'View',
            href: '#',
        },
    ],
};
