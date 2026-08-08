import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, RefreshCw, Search, Eye, EllipsisVertical, Pencil, Trash2, X, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import teachers from '@/routes/teachers';
import { useLocale } from '@/contexts/locale-context';

type PageProps = {
    auth: { user: { role: string } };
    teachers: {
        data: Array<{
            id: number;
            name: string;
            email: string;
            is_approved: boolean;
            assigned_batches_count: number;
        }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
};

export default function TeachersIndex({
    teachers: pagination,
    filters,
}: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';
    const [search, setSearch] = useState(filters.search || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: any | null;
    }>({ open: false, item: null });

    const handleSearch = () => {
        router.get(teachers.index(), { search }, { preserveState: true });
    };

    const handleDelete = (teacher: { id: number; name: string }) => {
        setDeleteDialog({ open: true, item: teacher });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(teachers.destroy(deleteDialog.item.id));
            toast.success('Teacher deactivated successfully');
            setDeleteDialog({ open: false, item: null });
        }
    };

    const handleApprove = (teacher: { id: number; name: string }) => {
        router.post(teachers.approve(teacher.id).url, {}, {
            onSuccess: () => {
                toast.success(`${teacher.name} has been approved`);
                router.reload({ only: ['teachers'] });
            },
        });
    };

    const handleReject = (teacher: { id: number; name: string }) => {
        router.post(teachers.reject(teacher.id).url, {}, {
            onSuccess: () => {
                toast.success(`${teacher.name}'s approval has been revoked`);
                router.reload({ only: ['teachers'] });
            },
        });
    };

    return (
        <>
            <Head title={t('teachers.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('teachers.title')}
                        description={t('teachers.title')}
                    />
                    {isAdmin && (
                        <Link href={teachers.create()}>
                            <Button>
                                <Plus className="mr-2 size-4" />
                                {t('teachers.create')}
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
                                    className="pr-9 pl-9"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            router.get(
                                                teachers.index(),
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
                            <Button variant="secondary" onClick={handleSearch}>
                                <Search className="size-4 sm:mr-2" />
                                <span className="hidden sm:inline">Search</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={refreshing}
                                onClick={() => {
                                    setRefreshing(true);
                                    router.reload({
                                        only: ['teachers'],
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
                                    <TableHead className="sticky left-0 z-10 min-w-[150px] bg-background">
                                        {t('teachers.name')}
                                    </TableHead>
                                    <TableHead>{t('teachers.email')}</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>{t('batches.title')}</TableHead>
                                    <TableHead className="w-[100px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pagination.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center"
                                        >
                                            {t('teachers.title')}{' '}
                                            {t('actions.search')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pagination.data.map((teacher) => (
                                        <TableRow key={teacher.id}>
                                            <TableCell className="sticky left-0 z-10 bg-background font-medium">
                                                {teacher.name}
                                            </TableCell>
                                            <TableCell>
                                                {teacher.email}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={teacher.is_approved ? 'success' : 'danger'}
                                                >
                                                    {teacher.is_approved ? 'Approved' : 'Pending'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {teacher.assigned_batches_count}
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
                                                            <Link href={teachers.show(teacher.id)}>
                                                                <Eye className="mr-2 size-4" />
                                                                {t('actions.view')}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {isAdmin && (
                                                            <>
                                                                {!teacher.is_approved && (
                                                                    <DropdownMenuItem onClick={() => handleApprove(teacher)}>
                                                                        <CheckCircle className="mr-2 size-4 text-green-600" />
                                                                        Approve
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {teacher.is_approved && (
                                                                    <DropdownMenuItem onClick={() => handleReject(teacher)}>
                                                                        <XCircle className="mr-2 size-4 text-yellow-600" />
                                                                        Revoke Approval
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={teachers.edit(teacher.id)}>
                                                                        <Pencil className="mr-2 size-4" />
                                                                        {t('actions.edit')}
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleDelete(teacher)} className="text-destructive">
                                                                    <Trash2 className="mr-2 size-4" />
                                                                    {t('actions.delete')}
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
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
                            itemName={t('teachers.title').toLowerCase() + 's'}
                            baseUrl={teachers.index()}
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
                title="Deactivate Teacher"
                description={`Are you sure you want to deactivate ${deleteDialog.item?.name}?`}
                confirmText="Deactivate"
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

TeachersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Teachers',
            href: teachers.index(),
        },
    ],
};
