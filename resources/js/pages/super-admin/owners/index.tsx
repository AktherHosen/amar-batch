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
        if (!toggleDialog.owner) return;
        router.post(`/dashboard/owners/${toggleDialog.owner.id}/toggle-active`, {}, {
            onSuccess: () => {
                toast.success('Owner status updated.');
            },
        });
        setToggleDialog({ open: false, owner: null });
    };

    const columns = (() => {
        type Col = NonNullable<DataTableProps<Owner, unknown>['columns']>[number];

        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: 'Name',
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
            } as Col,
            {
                id: 'email',
                accessorKey: 'email',
                header: 'Email',
                enableSorting: false,
                cell: ({ row }: any) => row.original.email || '-',
            } as Col,
            {
                id: 'tenant',
                accessorKey: 'tenant',
                header: 'Coaching Center',
                enableSorting: false,
                cell: ({ row }: any) => row.original.tenant?.name || '—',
            } as Col,
            {
                id: 'status',
                accessorKey: 'role',
                header: 'Status',
                enableSorting: false,
                cell: ({ row }: any) => {
                    const isActive = row.original.role === 'owner';
                    return (
                        <Badge variant={isActive ? 'default' : 'destructive'}>
                            {isActive ? 'Active' : 'Inactive'}
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
                                        View
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className={isActive ? 'text-destructive focus:text-destructive' : ''}
                                    onClick={() => setToggleDialog({ open: true, owner })}
                                >
                                    <Trash2 className="mr-2 size-4" />
                                    {isActive ? 'Deactivate' : 'Activate'}
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
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Owners" description="Manage coaching center owners" />
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
                            emptyMessage="No owners found."
                            getRowId={(row) => String(row.id)}
                            enableColumnVisibility={false}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder="Search owners..."
                                    searchValue={search}
                                    onSearchChange={handleSearch}
                                    activeFilterCount={activeFilterCount}
                                    onClearAll={clearAll}
                                    filters={[
                                        {
                                            id: 'status',
                                            placeholder: 'All Status',
                                            value: status,
                                            options: [
                                                { label: 'Active', value: 'active' },
                                                { label: 'Inactive', value: 'inactive' },
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
