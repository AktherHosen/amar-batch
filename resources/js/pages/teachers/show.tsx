import { Head, Link, router, usePage } from '@inertiajs/react';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
    const isAdmin = auth.user.role === 'admin';
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: any | null;
    }>({ open: false, item: null });

    const handleDelete = () => {
        setDeleteDialog({ open: true, item: teacher });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(teachers.destroy(deleteDialog.item.id));
            toast.success('Teacher deactivated successfully');
            setDeleteDialog({ open: false, item: null });
        }
    };

    return (
        <>
            <Head title={teacher.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={teachers.index()}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 size-4" />
                                {t('actions.back')}
                            </Button>
                        </Link>
                        <Heading
                            title={teacher.name}
                            description={t('teachers.title')}
                        />
                    </div>
                    {isAdmin && (
                        <div className="flex gap-2">
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
                        {teacher.assigned_batches.length > 0 ? (
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
                                            {t('batches.enrolled')}
                                        </TableHead>
                                        <TableHead>
                                            {t('students.status')}
                                        </TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teacher.assigned_batches.map((batch) => (
                                        <TableRow key={batch.id}>
                                            <TableCell className="font-medium">
                                                {batch.name}
                                            </TableCell>
                                            <TableCell>
                                                {batch.subject || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {batch.enrollments_count}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        batch.status ===
                                                        'active'
                                                            ? 'default'
                                                            : batch.status ===
                                                                'inactive'
                                                              ? 'secondary'
                                                              : 'destructive'
                                                    }
                                                >
                                                    {batch.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="p-1 text-center">
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
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {t('batches.title')}
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
                title="Deactivate Teacher"
                description={`Are you sure you want to deactivate ${deleteDialog.item?.name}?`}
                confirmText="Deactivate"
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
