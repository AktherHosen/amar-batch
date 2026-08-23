import { Head, Link, router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import type { DataTableProps } from '@/components/data-table';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
    };
};

export default function OwnersIndex({ owners: pagination, filters }: PageProps) {
    const { t } = useLocale();
    const [search, setSearch] = useState(filters.search || '');
    const [toggleDialog, setToggleDialog] = useState<{ open: boolean; owner: Owner | null }>({ open: false, owner: null });

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get('/dashboard/sa/owners', { search: value }, { preserveState: true });
    };

    const handleToggle = () => {
        if (!toggleDialog.owner) return;
        router.post(`/dashboard/sa/owners/${toggleDialog.owner.id}/toggle-active`, {}, {
            onSuccess: () => {
                toast.success(t('toast.updated_successfully'));
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
                        href={`/dashboard/sa/owners/${row.original.id}`}
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
                enableSorting: true,
                cell: ({ row }: any) => (
                    <span className="text-muted-foreground">{row.original.email}</span>
                ),
            } as Col,
            {
                id: 'tenant',
                accessorKey: 'tenant',
                header: 'Coaching Center',
                enableSorting: false,
                cell: ({ row }: any) => {
                    const owner: Owner = row.original;
                    return (
                        <span>{owner.tenant?.name || '—'}</span>
                    );
                },
            } as Col,
            {
                id: 'status',
                accessorKey: 'role',
                header: 'Status',
                enableSorting: false,
                cell: ({ row }: any) => {
                    const owner: Owner = row.original;
                    const isActive = owner.role === 'owner';
                    return (
                        <Badge variant={isActive ? 'default' : 'destructive'} className="whitespace-nowrap">
                            {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    );
                },
            } as Col,
            {
                id: 'created_at',
                accessorKey: 'created_at',
                header: 'Joined',
                enableSorting: true,
                cell: ({ row }: any) => (
                    <span>{new Date(row.original.created_at).toLocaleDateString()}</span>
                ),
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
                        <Button
                            variant="ghost"
                            size="sm"
                            className={isActive ? 'text-destructive hover:text-destructive' : ''}
                            onClick={() => setToggleDialog({ open: true, owner })}
                        >
                            {isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                    );
                },
            } as Col,
        ];
    })();

    return (
        <>
            <Head title="Owners" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title="Owner Management"
                        description="View and manage coaching center owners"
                    />
                </div>

                <Card className="min-w-0">
                    <CardContent className="pt-6">
                        <DataTable
                            columns={columns}
                            data={pagination.data}
                            currentPage={pagination.current_page}
                            lastPage={pagination.last_page}
                            total={pagination.total}
                            itemName="owners"
                            baseUrl="/dashboard/sa/owners"
                            preserveParams={{ search }}
                            emptyMessage="No owners found"
                            getRowId={(row) => String(row.id)}
                            toolbar={
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search owners..."
                                            value={search}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            className="h-8 w-[200px] pl-8 lg:w-[250px]"
                                        />
                                    </div>
                                    {search && (
                                        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleSearch('')}>
                                            <X className="size-4" />
                                        </Button>
                                    )}
                                </div>
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

