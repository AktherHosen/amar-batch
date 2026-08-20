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
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [refreshing, setRefreshing] = useState(false);

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get('/super-admin/tenants', { search: value, status }, { preserveState: true });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get('/super-admin/tenants', { search, status: value }, { preserveState: true });
    };

    const clearAll = () => {
        setSearch('');
        setStatus('');
        router.get('/super-admin/tenants', {}, { preserveState: true });
    };

    const activeFilterCount = status ? 1 : 0;

    const columns = (() => {
        type Col = NonNullable<DataTableProps<Tenant, unknown>['columns']>[number];

        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: 'Name',
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">{row.original.name}</span>
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
                id: 'users_count',
                accessorKey: 'users_count',
                header: 'Users',
                enableSorting: false,
                cell: ({ row }: any) => row.original.users_count,
            } as Col,
            {
                id: 'students_count',
                accessorKey: 'students_count',
                header: 'Students',
                enableSorting: false,
                cell: ({ row }: any) => row.original.students_count,
            } as Col,
            {
                id: 'batches_count',
                accessorKey: 'batches_count',
                header: 'Batches',
                enableSorting: false,
                cell: ({ row }: any) => row.original.batches_count,
            } as Col,
            {
                id: 'status',
                accessorKey: 'is_active',
                header: 'Status',
                enableSorting: false,
                cell: ({ row }: any) => (
                    <Badge variant={row.original.is_active ? 'default' : 'destructive'}>
                        {row.original.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                ),
            } as Col,
            {
                id: 'actions',
                header: '',
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }: any) => {
                    const tenant: Tenant = row.original;

                    return (
                        <Link href={`/super-admin/tenants/${tenant.id}`}>
                            <Button variant="ghost" size="sm" className="size-8 p-0">
                                <Eye className="size-4" />
                            </Button>
                        </Link>
                    );
                },
            } as Col,
        ];
    })();

    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Coaching Centers" description="Manage all coaching centers" />
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
                            baseUrl="/super-admin/tenants"
                            preserveParams={{ search, status }}
                            emptyMessage="No coaching centers found."
                            getRowId={(row) => String(row.id)}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder="Search coaching centers..."
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
        </>
    );
}

TenantsIndex.layout = {
    breadcrumbs: [
        { title: 'Coaching Centers', href: '/super-admin/tenants' },
    ],
};