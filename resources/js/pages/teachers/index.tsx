import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { EllipsisVertical, Eye, Pencil, Trash2, CheckCircle, XCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { isOwner } from '@/lib/role';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable, type DataTableProps } from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import { RefreshButton } from '@/components/refresh-button';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import teachers from '@/routes/teachers';
import { useLocale } from '@/contexts/locale-context';

type TeacherRow = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_approved: boolean;
    assigned_batches_count: number;
};

type PageProps = {
    auth: { user: { role: string } };
    teachers: {
        data: TeacherRow[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
    roles: Array<{
        id: number;
        name: string;
        slug: string;
    }>;
};

export default function TeachersIndex({
    teachers: pagination,
    filters,
    roles = [],
}: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const isAdmin = isOwner(auth.user);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [refreshing, setRefreshing] = useState(false);

    const roleName = (slug: string) => {
        if (slug === 'inactive') return t('teachers.inactive');
        return roles.find((r) => r.slug === slug)?.name ?? slug;
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(teachers.index(), { search: value, status }, { preserveState: true });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get(teachers.index(), { search, status: value }, { preserveState: true });
    };

    const clearAll = () => {
        setSearch('');
        setStatus('');
        router.get(teachers.index(), {}, { preserveState: true });
    };

    const activeFilterCount = status ? 1 : 0;

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

    const columns = (() => {
        type Col = NonNullable<DataTableProps<TeacherRow, unknown>['columns']>[number];
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
                id: 'role',
                accessorKey: 'role',
                header: t('teachers.role'),
                enableSorting: false,
                cell: ({ row }: any) => (
                    <span className="capitalize">{roleName(row.original.role)}</span>
                ),
            } as Col,
            {
                id: 'status',
                accessorKey: 'status',
                header: t('teachers.status'),
                enableSorting: false,
                cell: ({ row }: any) => (
                    <Badge
                        variant={row.original.role === 'inactive' ? 'danger' : 'success'}
                    >
                        {row.original.role === 'inactive' ? t('teachers.inactive') : t('teachers.active')}
                    </Badge>
                ),
            } as Col,
            {
                id: 'assigned_batches_count',
                accessorKey: 'assigned_batches_count',
                header: t('batches.title'),
                enableSorting: false,
                cell: ({ row }: any) => row.original.assigned_batches_count,
            } as Col,
            {
                id: 'actions',
                header: '',
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }: any) => {
                    const teacher: TeacherRow = row.original;
                    return (
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
                                        {teacher.role === 'teacher' && !teacher.is_approved && (
                                            <DropdownMenuItem onClick={() => handleApprove(teacher)}>
                                                <CheckCircle className="mr-2 size-4 text-green-600" />
                                                {t('teachers.approve')}
                                            </DropdownMenuItem>
                                        )}
                                        {teacher.role === 'teacher' && teacher.is_approved && (
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
                    );
                },
            } as Col,
        ];
    })();

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
                    <div className="flex items-center gap-1">
                        <RefreshButton
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                router.reload({
                                    only: ['teachers'],
                                    onFinish: () => setRefreshing(false),
                                });
                            }}
                        />
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
                            itemName={t('teachers.title').toLowerCase() + 's'}
                            baseUrl={teachers.index().url}
                            preserveParams={{ search, status }}
                            emptyMessage={t('teachers.no_teachers')}
                            getRowId={(row) => String(row.id)}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder={t('actions.search') + '...'}
                                    searchValue={search}
                                    onSearchChange={handleSearch}
                                    activeFilterCount={activeFilterCount}
                                    onClearAll={clearAll}
                                    filters={[
                                        {
                                            id: 'status',
                                            placeholder: t('teachers.all_status'),
                                            value: status,
                                            options: [
                                                { label: t('teachers.active'), value: 'active' },
                                                { label: t('teachers.inactive'), value: 'inactive' },
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