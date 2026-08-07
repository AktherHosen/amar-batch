import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Search, EllipsisVertical, Pencil, Trash2 } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import coachingClasses from '@/routes/coaching-classes';
import { useLocale } from '@/contexts/locale-context';

type CoachingClass = {
    id: number;
    name: string;
    default_fee: number;
    students_count: number;
};

type PageProps = {
    auth: { user: { role: string } };
    classes: {
        data: CoachingClass[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
};

export default function CoachingClassesIndex({
    classes: pagination,
    filters,
}: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';
    const [search, setSearch] = useState(filters.search || '');
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: any | null;
    }>({ open: false, item: null });

    const handleSearch = () => {
        router.get(
            coachingClasses.index(),
            { search },
            { preserveState: true },
        );
    };

    const handleDelete = (cls: CoachingClass) => {
        setDeleteDialog({ open: true, item: cls });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(coachingClasses.destroy(deleteDialog.item.id));
            toast.success('Coaching class deleted successfully');
            setDeleteDialog({ open: false, item: null });
        }
    };

    return (
        <>
            <Head title={t('classes.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('classes.title')}
                        description={t('classes.title')}
                    />
                    {isAdmin && (
                        <Link href={coachingClasses.create()}>
                            <Button>
                                <Plus className="mr-2 size-4" />
                                {t('classes.create')}
                            </Button>
                        </Link>
                    )}
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-4 flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder={t('actions.search') + '...'}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleSearch()
                                    }
                                    className="pl-9"
                                />
                            </div>
                            <Button variant="secondary" onClick={handleSearch}>
                                {t('actions.search')}
                            </Button>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="sticky left-0 z-10 min-w-[150px] bg-background">
                                        {t('classes.name')}
                                    </TableHead>
                                    <TableHead>
                                        {t('classes.default_fee')}
                                    </TableHead>
                                    <TableHead>
                                        {t('batches.enrolled')}
                                    </TableHead>
                                    {isAdmin && (
                                        <TableHead className="w-[50px]"></TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pagination.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={isAdmin ? 4 : 3}
                                            className="text-center"
                                        >
                                            {t('classes.title')}{' '}
                                            {t('actions.search')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pagination.data.map((cls) => (
                                        <TableRow key={cls.id}>
                                            <TableCell className="sticky left-0 z-10 bg-background font-medium">
                                                {cls.name}
                                            </TableCell>
                                            <TableCell>
                                                {Number(
                                                    cls.default_fee,
                                                ).toFixed(0)}
                                            </TableCell>
                                            <TableCell>
                                                {cls.students_count}
                                            </TableCell>
                                            {isAdmin && (
                                                <TableCell className="p-1 text-center">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="size-8 p-0">
                                                                <EllipsisVertical className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={coachingClasses.edit(cls.id)}>
                                                                    <Pencil className="mr-2 size-4" />
                                                                    {t('actions.edit')}
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDelete(cls)} className="text-destructive">
                                                                <Trash2 className="mr-2 size-4" />
                                                                {t('actions.delete')}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {pagination.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {pagination.data.length} of{' '}
                                    {pagination.total} {t('classes.title')}
                                </p>
                                <div className="flex gap-2">
                                    {pagination.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(
                                                    coachingClasses.index(),
                                                    {
                                                        page:
                                                            pagination.current_page -
                                                            1,
                                                        search,
                                                    },
                                                    { preserveState: true },
                                                )
                                            }
                                        >
                                            {t('actions.back')}
                                        </Button>
                                    )}
                                    {pagination.current_page <
                                        pagination.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(
                                                    coachingClasses.index(),
                                                    {
                                                        page:
                                                            pagination.current_page +
                                                            1,
                                                        search,
                                                    },
                                                    { preserveState: true },
                                                )
                                            }
                                        >
                                            Next
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    setDeleteDialog({ open, item: deleteDialog.item })
                }
                title="Delete Coaching Class"
                description={`Are you sure you want to delete ${deleteDialog.item?.name}?`}
                confirmText="Delete"
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

CoachingClassesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Coaching Classes',
            href: coachingClasses.index(),
        },
    ],
};
