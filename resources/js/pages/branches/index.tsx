import Heading from '@/components/heading';
import { isOwner } from '@/lib/role';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable, type DataTableProps } from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import { RefreshButton } from '@/components/refresh-button';
import CellTitle from '@/components/cell-title';
import { useLocale } from '@/contexts/locale-context';
import branches from '@/routes/branches';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { EllipsisVertical, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';

type Branch = {
    id: number;
    name: string;
    code: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    is_active: boolean;
};

type PageProps = {
    branches: {
        data: Branch[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: { search?: string };
};

export default function BranchesIndex({
    branches: pagination,
    filters,
}: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage().props;
    const isAdmin = isOwner(auth.user);
    const [search, setSearch] = useState(filters.search || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: Branch | null;
    }>({ open: false, item: null });

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            branches.index(),
            { search: value },
            { preserveState: true },
        );
    };

    const handleRefresh = () => {
        setRefreshing(true);
        router.reload({ onFinish: () => setRefreshing(false) });
    };

    const clearAll = () => {
        setSearch('');
        router.get(branches.index(), {}, { preserveState: true });
    };

    const handleDelete = (branch: Branch) => {
        setDeleteDialog({ open: true, item: branch });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(branches.destroy(deleteDialog.item.id));
            toast.success(t('branches.deleted'));
            setDeleteDialog({ open: false, item: null });
        }
    };

    const columns = (() => {
        type Col = NonNullable<
            DataTableProps<Branch, unknown>['columns']
        >[number];
        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: t('branches.name'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <CellTitle
                        title={row.original.name}
                        href={branches.show(row.original.id).url}
                    />
                ),
            } as Col,
            {
                id: 'code',
                accessorKey: 'code',
                header: t('branches.code'),
                enableSorting: false,
                cell: ({ row }: any) => row.original.code || '-',
            } as Col,
            {
                id: 'address',
                accessorKey: 'address',
                header: t('branches.address'),
                enableSorting: false,
                cell: ({ row }: any) => row.original.address || '-',
            } as Col,
            {
                id: 'phone',
                accessorKey: 'phone',
                header: t('branches.phone'),
                enableSorting: false,
                cell: ({ row }: any) => row.original.phone || '-',
            } as Col,
            {
                id: 'status',
                accessorKey: 'is_active',
                header: t('branches.status'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const branch: Branch = row.original;
                    return (
                        <Badge
                            variant={branch.is_active ? 'success' : 'danger'}
                        >
                            {branch.is_active
                                ? t('branches.active')
                                : t('branches.inactive')}
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
                    const branch: Branch = row.original;
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
                                <DropdownMenuItem
                                    onClick={() =>
                                        router.get(branches.show(branch.id))
                                    }
                                >
                                    <Eye className="mr-2 size-4" />
                                    {t('actions.view')}
                                </DropdownMenuItem>
                                {isAdmin && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                router.get(
                                                    branches.edit(branch.id),
                                                )
                                            }
                                        >
                                            <Pencil className="mr-2 size-4" />
                                            {t('actions.edit')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => handleDelete(branch)}
                                        >
                                            <Trash2 className="mr-2 size-4" />
                                            {t('actions.delete')}
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
            <Head title={t('branches.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('branches.title')}
                        description={t('branches.desc')}
                    />
                    <div className="flex items-center gap-1">
                        <RefreshButton
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                        />
                        {isAdmin && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 p-0"
                                    >
                                        <EllipsisVertical className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href={branches.create()}>
                                            <Plus className="mr-2 size-4" />
                                            {t('branches.create')}
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
                            itemName={t('branches.title').toLowerCase()}
                            baseUrl={branches.index().url}
                            preserveParams={{ search }}
                            emptyMessage={t('branches.no_branches')}
                            getRowId={(row) => String(row.id)}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder={
                                        t('actions.search') + '...'
                                    }
                                    searchValue={search}
                                    onSearchChange={handleSearch}
                                    activeFilterCount={search ? 1 : 0}
                                    onClearAll={clearAll}
                                />
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    setDeleteDialog({ ...deleteDialog, open })
                }
                title={t('confirm.are_you_sure')}
                description={t('branches.delete_confirm')}
                confirmText={t('confirm.delete')}
                onConfirm={confirmDelete}
            />
        </>
    );
}

BranchesIndex.layout = {
    breadcrumbs: [{ title: 'Branches', href: branches.index() }],
};
