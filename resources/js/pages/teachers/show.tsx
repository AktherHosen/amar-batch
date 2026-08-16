import { Head, Link, router, usePage } from '@inertiajs/react';
import { isOwner } from '@/lib/role';
import { ArrowLeft, EllipsisVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, type DataTableProps } from '@/components/data-table';
import teachers from '@/routes/teachers';
import batches from '@/routes/batches';
import { useLocale } from '@/contexts/locale-context';

type PageProps = {
    auth: { user: { role: string } };
};

type Batch = {
    id: number;
    name: string;
    subject: string | null;
    enrollments_count: number;
    status: string;
};

type Teacher = {
    id: number;
    name: string;
    email: string;
    assigned_batches: Batch[];
    assigned_batches_count: number;
};

type TeachersShowProps = {
    teacher: Teacher;
};

export default function TeachersShow({ teacher }: TeachersShowProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const isAdmin = isOwner(auth.user);
    const [deleteDialog, setDeleteDialog] = useState(false);

    const handleDelete = () => {
        setDeleteDialog(true);
    };

    const confirmDelete = () => {
        router.delete(teachers.destroy(teacher.id));
        toast.success(t('toast.deactivated_successfully'));
        setDeleteDialog(false);
    };

    const columns = (() => {
        type Col = NonNullable<DataTableProps<Batch, unknown>['columns']>[number];
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
                cell: ({ row }: any) => <span>{row.original.enrollments_count}</span>,
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
                                <Button variant="ghost" size="sm" className="size-8 p-0">
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
                <div className="flex items-center justify-between min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <Link href={teachers.index()} className="shrink-0">
                            <Button variant="ghost" size="icon" className="size-9">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <h1 className="truncate text-lg font-bold tracking-tight sm:text-2xl">{teacher.name}</h1>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-2 shrink-0">
                            <Link href={teachers.edit(teacher.id)}>
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

                <Card>
                    <CardHeader>
                        <CardTitle>{t('teachers.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t('teachers.name')}
                            </p>
                            <p className="font-medium">{teacher.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t('teachers.email')}
                            </p>
                            <p className="font-medium">{teacher.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t('batches.title')}
                            </p>
                            <p className="font-medium">
                                {teacher.assigned_batches_count}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('batches.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={teacher.assigned_batches}
                            showPagination={false}
                            emptyMessage={t('batches.title')}
                            getRowId={(row) => String(row.id)}
                        />
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog}
                onOpenChange={setDeleteDialog}
                title={t('teachers.deactivate_title')}
                description={t('teachers.deactivate_confirm').replace('{name}', teacher.name)}
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
