import { Link, router } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { DataTable  } from '@/components/data-table';
import type {DataTableProps} from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import Heading from '@/components/heading';
import { RefreshButton } from '@/components/refresh-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';

type Tenant = {
    id: number;
    name: string;
    slug: string;
    email: string | null;
    is_active: boolean;
    created_at: string;
    users_count: number;
    students_count: number;
    batches_count: number;
};

type PageProps = {
    tenants: {
        data: Tenant[];
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

export default function TenantsIndex({ tenants: pagination, filters }: PageProps) {
    const { t } = useLocale();
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [refreshing, setRefreshing] = useState(false);

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get('/dashboard/tenants', { search: value, status }, { preserveState: true });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get('/dashboard/tenants', { search, status: value }, { preserveState: true });
    };

    const clearAll = () => {
        setSearch('');
        setStatus('');
        router.get('/dashboard/tenants', {}, { preserveState: true });
    };

    const activeFilterCount = status ? 1 : 0;

    const columns: NonNullable<DataTableProps<Tenant, unknown>['columns']> = [
        {
            id: 'name',
            accessorKey: 'name',
            header: t('super_admin.name'),
            enableSorting: true,
            meta: { sticky: true },
            cell: ({ row }: any) => (
                <span className="font-medium">{row.original.name}</span>
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
            id: 'users_count',
            accessorKey: 'users_count',
            header: t('super_admin.users'),
            enableSorting: false,
            cell: ({ row }: any) => row.original.users_count,
        },
        {
            id: 'students_count',
            accessorKey: 'students_count',
            header: t('super_admin.students'),
            enableSorting: false,
            cell: ({ row }: any) => row.original.students_count,
        },
        {
            id: 'batches_count',
            accessorKey: 'batches_count',
            header: t('super_admin.batches'),
            enableSorting: false,
            cell: ({ row }: any) => row.original.batches_count,
        },
        {
            id: 'status',
            accessorKey: 'is_active',
            header: t('super_admin.status'),
            enableSorting: false,
            cell: ({ row }: any) => (
                <Badge variant={row.original.is_active ? 'default' : 'destructive'}>
                    {row.original.is_active ? t('super_admin.active') : t('super_admin.inactive')}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: '',
            enableSorting: false,
            enableHiding: false,
            cell: ({ row }: any) => {
                const tenant: Tenant = row.original;

                return (
                    <div className="flex items-center gap-1">
                        <Link href={`/dashboard/tenants/${tenant.id}`}>
                            <Button variant="ghost" size="sm" className="size-8 p-0">
                                <Eye className="size-4" />
                            </Button>
                        </Link>
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-3 sm:p-4">
                <div className="flex items-start justify-between">
                    <Heading title={t('super_admin.coaching_centers')} description={t('super_admin.manage_coaching_centers')} />
                    <div className="flex items-center gap-1">
                        <RefreshButton
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                router.reload({
                                    only: ['tenants'],
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
                            itemName="coaching centers"
                            baseUrl="/dashboard/tenants"
                            preserveParams={{ search, status }}
                            emptyMessage="No coaching centers found."
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
        </>
    );
}
