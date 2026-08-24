import { Link, router } from '@inertiajs/react';
import { EllipsisVertical, Pencil, Plus, Trash2 } from 'lucide-react';
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

type Plan = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price_monthly: number;
    price_yearly: number;
    max_students: number;
    max_staff: number;
    max_batches: number;
    features: string[] | null;
    is_active: boolean;
    is_default: boolean;
};

type PageProps = {
    plans: {
        data: Plan[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
};

export default function PlansIndex({ plans: pagination, filters }: PageProps) {
    const { t, formatCurrency } = useLocale();
    const [search, setSearch] = useState(filters.search || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Plan | null }>({
        open: false,
        item: null,
    });

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get('/dashboard/plans', { search: value }, { preserveState: true });
    };

    const handleDelete = (plan: Plan) => {
        setDeleteDialog({ open: true, item: plan });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(`/dashboard/plans/${deleteDialog.item.id}`);
            toast.success(t('toast.deleted_successfully'));
            setDeleteDialog({ open: false, item: null });
        }
    };

    const formatLimit = (value: number) => (value === -1 ? 'Unlimited' : value.toString());

    const columns = (() => {
        type Col = NonNullable<DataTableProps<Plan, unknown>['columns']>[number];

        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: 'Plan',
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{row.original.name}</span>
                        {row.original.is_default && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                    </div>
                ),
            } as Col,
            {
                id: 'price',
                accessorKey: 'price_monthly',
                header: 'Monthly Price',
                enableSorting: true,
                cell: ({ row }: any) => (
                    <span className="font-semibold">
                        {row.original.price_monthly === 0 ? 'Free' : formatCurrency(row.original.price_monthly)}
                    </span>
                ),
            } as Col,
            {
                id: 'students',
                accessorKey: 'max_students',
                header: 'Students',
                enableSorting: false,
                cell: ({ row }: any) => formatLimit(row.original.max_students),
            } as Col,
            {
                id: 'staff',
                accessorKey: 'max_staff',
                header: 'Staff',
                enableSorting: false,
                cell: ({ row }: any) => formatLimit(row.original.max_staff),
            } as Col,
            {
                id: 'batches',
                accessorKey: 'max_batches',
                header: 'Batches',
                enableSorting: false,
                cell: ({ row }: any) => formatLimit(row.original.max_batches),
            } as Col,
            {
                id: 'features',
                accessorKey: 'features',
                header: 'Features',
                enableSorting: false,
                cell: ({ row }: any) => {
                    const features = row.original.features;
                    if (!features || features.length === 0) return '—';
                    return (
                        <div className="flex flex-wrap gap-1">
                            {features.slice(0, 3).map((f: string) => (
                                <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                            ))}
                            {features.length > 3 && (
                                <Badge variant="outline" className="text-xs">+{features.length - 3}</Badge>
                            )}
                        </div>
                    );
                },
            } as Col,
            {
                id: 'actions',
                header: '',
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }: any) => {
                    const plan: Plan = row.original;

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="size-8 p-0">
                                    <EllipsisVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/plans/${plan.id}/edit`}>
                                        <Pencil className="mr-2 size-4" />
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleDelete(plan)}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="mr-2 size-4" />
                                    Delete
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
                    <Heading title="Plans" description="Manage subscription plans" />
                    <div className="flex items-center gap-2">
                        <RefreshButton
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                router.reload({ only: ['plans'], onFinish: () => setRefreshing(false) });
                            }}
                        />
                        <Link href="/dashboard/plans/create">
                            <Button>
                                <Plus className="mr-2 size-4" />
                                Create Plan
                            </Button>
                        </Link>
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
                            itemName="plans"
                            baseUrl="/dashboard/plans"
                            preserveParams={{ search }}
                            emptyMessage="No plans found."
                            getRowId={(row) => String(row.id)}
                            enableColumnVisibility={false}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder="Search plans..."
                                    searchValue={search}
                                    onSearchChange={handleSearch}
                                    activeFilterCount={0}
                                    onClearAll={() => handleSearch('')}
                                />
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, item: deleteDialog.item })}
                title="Delete Plan"
                description={`Are you sure you want to delete "${deleteDialog.item?.name}"? This may affect tenants using this plan.`}
                confirmText="Delete"
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}
