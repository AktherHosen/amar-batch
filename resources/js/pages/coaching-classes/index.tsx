import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import { Plus, RefreshCw, Search, EllipsisVertical, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { isOwner } from '@/lib/role';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Pagination from '@/components/pagination';
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

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
    let timer: ReturnType<typeof setTimeout>;
    const debounced = (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
    debounced.cancel = () => clearTimeout(timer);
    return debounced;
}

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
    const isAdmin = isOwner(auth.user);
    const [search, setSearch] = useState(filters.search || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: any | null;
    }>({ open: false, item: null });

    const debouncedSearch = useCallback(
        debounce((value: string) => {
            router.get(
                coachingClasses.index(),
                { search: value },
                { preserveState: true },
            );
        }, 300),
        [],
    );

    const handleDelete = (cls: CoachingClass) => {
        setDeleteDialog({ open: true, item: cls });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(coachingClasses.destroy(deleteDialog.item.id));
            toast.success(t('toast.deleted_successfully'));
            setDeleteDialog({ open: false, item: null });
        }
    };

    return (
        <>
            <Head title={t('classes.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                        <h2 className="text-xl font-semibold tracking-tight">
                            {t('classes.title')}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {t('classes.desc')}
                        </p>
                    </div>
                    {isAdmin && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8 p-0">
                                    <EllipsisVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={coachingClasses.create()}>
                                        <Plus className="mr-2 size-4" />
                                        {t('classes.create')}
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        debouncedSearch(e.target.value);
                                    }}
                                    className="pr-9 pl-9"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            router.get(
                                                coachingClasses.index(),
                                                {},
                                                { preserveState: true },
                                            );
                                        }}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={refreshing}
                                onClick={() => {
                                    setRefreshing(true);
                                    router.reload({
                                        only: ['classes'],
                                        onFinish: () => setRefreshing(false),
                                    });
                                }}
                            >
                                <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="sticky left-0 z-10 min-w-[150px] bg-background whitespace-nowrap">
                                        {t('classes.name')}
                                    </TableHead>
                                    <TableHead className="whitespace-nowrap">
                                        {t('classes.default_fee')}
                                    </TableHead>
                                    <TableHead className="whitespace-nowrap">
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
                                            No coaching classes found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pagination.data.map((cls) => (
                                        <TableRow key={cls.id}>
                                            <TableCell className="sticky left-0 z-10 bg-background font-medium whitespace-nowrap">
                                                {cls.name}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {Number(
                                                    cls.default_fee,
                                                ).toFixed(0)}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
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

                        <Pagination
                            currentPage={pagination.current_page}
                            lastPage={pagination.last_page}
                            total={pagination.total}
                            perPage={pagination.per_page}
                            itemName={t('classes.title').toLowerCase() + 's'}
                            baseUrl={coachingClasses.index()}
                            preserveParams={{ search }}
                        />
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    setDeleteDialog({ open, item: deleteDialog.item })
                }
                title={t('classes.delete_title')}
                description={t('classes.delete_confirm').replace('{name}', deleteDialog.item?.name || '')}
                confirmText={t('actions.delete')}
                cancelText={t('actions.cancel')}
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
