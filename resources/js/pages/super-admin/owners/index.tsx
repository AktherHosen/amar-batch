import { Link, router } from '@inertiajs/react';
import { EllipsisVertical, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import type { DataTableProps } from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import Heading from '@/components/heading';
import { RefreshButton } from '@/components/refresh-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLocale } from '@/contexts/locale-context';

type Owner = {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    tenant: { id: number; name: string; slug: string } | null;
};

type PageProps = {
    owners: {
        data: Owner[];
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

export default function OwnersIndex({ owners: pagination, filters }: PageProps) {
    const { t } = useLocale();
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [refreshing, setRefreshing] = useState(false);
    const [toggleDialog, setToggleDialog] = useState<{ open: boolean; owner: Owner | null }>({ open: false, owner: null });

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get('/dashboard/owners', { search: value, status }, { preserveState: true });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get('/dashboard/owners', { search, status: value }, { preserveState: true });
    };

    const clearAll = () => {
        setSearch('');
        setStatus('');
        router.get('/dashboard/owners', {}, { preserveState: true });
    };

    const activeFilterCount = status ? 1 : 0;

    const handleToggle = () => {
        if (!toggleDialog.owner) {
return;
}

        router.post(`/dashboard/owners/${toggleDialog.owner.id}/toggle-active`, {}, {
            onSuccess: () => {
                toast.success(t('toast.updated_successfully'));
            },
        });
        setToggleDialog({ open: false, owner: null });
    };

    const columns: NonNullable<DataTableProps<Owner, unknown>['columns']> = [
        {
            id: 'name',
            accessorKey: 'name',
            header: t('super_admin.name'),
            enableSorting: true,
            meta: { sticky: true },
            cell: ({ row }: any) => (
                <Link
                    href={`/dashboard/owners/${row.original.id}`}
                    className="font-medium hover:underline"
                >
                    {row.original.name}
                </Link>
            ),
        },
        {
            id: 'email',
            accessorKey: 'email',
            header: t('super_admin.email'),
            enableSorting: false,
            cell: ({ row }: any) => row.original.email || '-',
        },
        {
            id: 'tenant',
            accessorKey: 'tenant',
            header: t('super_admin.coaching_centers'),
            enableSorting: false,
            cell: ({ row }: any) => row.original.tenant?.name || '—',
        },
        {
            id: 'status',
            accessorKey: 'role',
            header: t('super_admin.status'),
            enableSorting: false,
            cell: ({ row }: any) => {
                const isActive = row.original.role === 'owner';

                return (
                    <Badge variant={isActive ? 'default' : 'destructive'}>
                        {isActive ? t('super_admin.active') : t('super_admin.inactive')}
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            header: '',
            enableSorting: false,
            enableHiding: false,
            cell: ({ row }: any) => {
                const owner: Owner = row.original;
                const isActive = owner.role === 'owner';

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="size-8 p-0">
                                <EllipsisVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/owners/${owner.id}`}>
                                    <Eye className="mr-2 size-4" />
                                    {t('super_admin.view_details')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className={isActive ? 'text-destructive focus:text-destructive' : ''}
                                onClick={() => setToggleDialog({ open: true, owner })}
                            >
                                <Trash2 className="mr-2 size-4" />
                                {isActive ? t('super_admin.deactivate') : t('super_admin.activate')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-3 sm:p-4">
                <div className="flex items-start justify-between">
                    <Heading title={t('super_admin.owners')} description={t('super_admin.manage_owners')} />
                    <div className="flex items-center gap-1">
                        <RefreshButton
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                router.reload({
                                    only: ['owners'],
                                    onFinish: () => setRefreshing(false),
                                });
                            }}
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
                            itemName="owners"
                            baseUrl="/dashboard/owners"
                            preserveParams={{ search, status }}
                            emptyMessage={t('super_admin.no_owners')}
                            getRowId={(row) => String(row.id)}
                            enableColumnVisibility={false}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder={`${t('actions.search')}...`}
                                    searchValue={search}
                                    onSearchChange={handleSearch}
                                    activeFilterCount={activeFilterCount}
                                    onClearAll={clearAll}
                                    filters={[
                                        {
                                            id: 'status',
                                            placeholder: t('super_admin.all_status'),
                                            value: status,
                                            options: [
                                                { label: t('super_admin.active'), value: 'active' },
                                                { label: t('super_admin.inactive'), value: 'inactive' },
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
                open={toggleDialog.open}
                onOpenChange={(open) => setToggleDialog({ open, owner: toggleDialog.owner })}
                title={toggleDialog.owner?.role === 'owner' ? 'Deactivate Owner' : 'Activate Owner'}
                description={`Are you sure you want to ${toggleDialog.owner?.role === 'owner' ? 'deactivate' : 'activate'} "${toggleDialog.owner?.name}"? ${toggleDialog.owner?.role === 'owner' ? 'They will lose access to their coaching center.' : ''}`}
                confirmText={toggleDialog.owner?.role === 'owner' ? 'Deactivate' : 'Activate'}
                variant={toggleDialog.owner?.role === 'owner' ? 'destructive' : 'default'}
                onConfirm={handleToggle}
            />
        </>
    );
}
