import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { EllipsisVertical, Eye, Pencil, Trash2, X, CheckCircle, XCircle, Plus, RefreshCw, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { isOwner } from '@/lib/role';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
    let timer: ReturnType<typeof setTimeout>;
    const debounced = (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
    debounced.cancel = () => clearTimeout(timer);
    return debounced;
}

type PageProps = {
    auth: { user: { role: string } };
    teachers: {
        data: Array<{
            id: number;
            name: string;
            email: string;
            role: string;
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
        status?: string;
    };
};

export default function TeachersIndex({
    teachers: pagination,
    filters,
}: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const isAdmin = isOwner(auth.user);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [refreshing, setRefreshing] = useState(false);

    const debouncedSearch = useCallback(
        debounce((value: string, statusValue: string) => {
            router.get(teachers.index(), { search: value, status: statusValue }, { preserveState: true });
        }, 300),
        [],
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const handleStatusChange = (value: string) => {
        const newStatus = value === 'all' ? '' : value;
        setStatus(newStatus);
        router.get(teachers.index(), { search, status: newStatus }, { preserveState: true });
    };

    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: any | null;
    }>({ open: false, item: null });
    const [approveDialog, setApproveDialog] = useState<{
        open: boolean;
        item: any | null;
    }>({ open: false, item: null });
    const [rejectDialog, setRejectDialog] = useState<{
        open: boolean;
        item: any | null;
    }>({ open: false, item: null });

    const handleDelete = (teacher: { id: number; name: string; role: string }) => {
        setDeleteDialog({ open: true, item: teacher });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(teachers.destroy(deleteDialog.item.id));
            toast.success(deleteDialog.item.role === 'inactive' ? t('toast.updated_successfully') : t('toast.deactivated_successfully'));
            setDeleteDialog({ open: false, item: null });
        }
    };

    const handleApprove = (teacher: { id: number; name: string }) => {
        setApproveDialog({ open: true, item: teacher });
    };

    const confirmApprove = () => {
        if (approveDialog.item) {
            router.post(teachers.approve(approveDialog.item.id).url, {}, {
                onSuccess: () => {
                    toast.success(`${approveDialog.item.name} ${t('toast.approved_successfully')}`);
                    router.reload({ only: ['teachers'] });
                },
            });
            setApproveDialog({ open: false, item: null });
        }
    };

    const handleReject = (teacher: { id: number; name: string }) => {
        setRejectDialog({ open: true, item: teacher });
    };

    const confirmReject = () => {
        if (rejectDialog.item) {
            router.post(teachers.reject(rejectDialog.item.id).url, {}, {
                onSuccess: () => {
                    toast.success(`${rejectDialog.item.name} ${t('toast.revoked_successfully')}`);
                    router.reload({ only: ['teachers'] });
                },
            });
            setRejectDialog({ open: false, item: null });
        }
    };

    return (
        <>
            <Head title={t('teachers.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                        <h2 className="text-xl font-semibold tracking-tight">
                            {t('teachers.title')}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {t('teachers.desc')}
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
                                    <Link href={teachers.create()}>
                                        <Plus className="mr-2 size-4" />
                                        {t('teachers.create')}
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder={t('actions.search') + '...'}
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        debouncedSearch(e.target.value, status);
                                    }}
                                    className="pr-9 pl-9"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            router.get(teachers.index(), { status }, { preserveState: true });
                                        }}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Select
                                    value={status || 'all'}
                                    onValueChange={handleStatusChange}
                                >
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder={t('teachers.all_status')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('teachers.all_status')}
                                        </SelectItem>
                                        <SelectItem value="active">
                                            {t('teachers.active')}
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            {t('teachers.inactive')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
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
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="sticky left-0 z-10 min-w-[150px] bg-background whitespace-nowrap">
                                        {t('teachers.name')}
                                    </TableHead>
                                    <TableHead className="whitespace-nowrap">{t('teachers.email')}</TableHead>
                                    <TableHead className="whitespace-nowrap">{t('teachers.status')}</TableHead>
                                    <TableHead className="whitespace-nowrap">{t('batches.title')}</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            {pagination.data.length === 0 ? (
                                <TableBody>
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center"
                                        >
                                            {t('teachers.no_teachers')}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            ) : (
                                <motion.tbody
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        hidden: {},
                                        visible: { transition: { staggerChildren: 0.03 } },
                                    }}
                                >
                                {pagination.data.map((teacher) => (
                                    <motion.tr
                                        key={teacher.id}
                                        variants={{
                                            hidden: { opacity: 0, x: -8 },
                                            visible: { opacity: 1, x: 0 },
                                        }}
                                    >
                                            <TableCell className="sticky left-0 z-10 bg-background font-medium whitespace-nowrap">
                                                {teacher.name}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {teacher.email}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <Badge
                                                    variant={teacher.role === 'inactive' ? 'danger' : 'success'}
                                                >
                                                    {teacher.role === 'inactive' ? t('teachers.inactive') : t('teachers.active')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
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
                                                                {teacher.role === 'staff' && !teacher.is_approved && (
                                                                    <DropdownMenuItem onClick={() => handleApprove(teacher)}>
                                                                        <CheckCircle className="mr-2 size-4 text-green-600" />
                                                                        {t('teachers.approve')}
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {teacher.role === 'staff' && teacher.is_approved && (
                                                                    <DropdownMenuItem onClick={() => handleReject(teacher)}>
                                                                        <XCircle className="mr-2 size-4 text-yellow-600" />
                                                                        {t('teachers.revoke_approval')}
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={teachers.edit(teacher.id)}>
                                                                        <Pencil className="mr-2 size-4" />
                                                                        {t('actions.edit')}
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleDelete(teacher)} className={teacher.role === 'inactive' ? '' : 'text-destructive'}>
                                                                    <Trash2 className="mr-2 size-4" />
                                                                    {teacher.role === 'inactive' ? t('teachers.reactivate') : t('actions.delete')}
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                    </motion.tr>
                                ))}
                                </motion.tbody>
                            )}
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
                title={deleteDialog.item?.role === 'inactive' ? t('teachers.reactivate_title') : t('teachers.deactivate_title')}
                description={(deleteDialog.item?.role === 'inactive' ? t('teachers.reactivate_confirm') : t('teachers.deactivate_confirm')).replace('{name}', deleteDialog.item?.name ?? '')}
                confirmText={deleteDialog.item?.role === 'inactive' ? t('teachers.reactivate') : t('teachers.deactivate')}
                cancelText={t('actions.cancel')}
                variant={deleteDialog.item?.role === 'inactive' ? 'default' : 'destructive'}
                onConfirm={confirmDelete}
            />

            <ConfirmDialog
                open={approveDialog.open}
                onOpenChange={(open) =>
                    setApproveDialog({ open, item: approveDialog.item })
                }
                title={t('teachers.approve_title')}
                description={t('teachers.approve_confirm').replace('{name}', approveDialog.item?.name ?? '')}
                confirmText={t('teachers.approve')}
                cancelText={t('actions.cancel')}
                onConfirm={confirmApprove}
            />

            <ConfirmDialog
                open={rejectDialog.open}
                onOpenChange={(open) =>
                    setRejectDialog({ open, item: rejectDialog.item })
                }
                title={t('teachers.revoke_title')}
                description={t('teachers.revoke_confirm').replace('{name}', rejectDialog.item?.name ?? '')}
                confirmText={t('teachers.revoke_approval')}
                cancelText={t('actions.cancel')}
                variant="destructive"
                onConfirm={confirmReject}
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
