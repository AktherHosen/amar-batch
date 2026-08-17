import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { EllipsisVertical, PenLine, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type DataTableProps } from '@/components/data-table';
import roles from '@/routes/roles';

type RoleItem = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_system: boolean;
    users_count: number;
    permissions: string[];
};

type PageProps = {
    auth: { user: { role: string } };
    roles: {
        data: RoleItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
};

export default function RolesIndex({ roles: pagination }: PageProps) {
    const { auth } = usePage<PageProps>().props;
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: RoleItem | null;
    }>({ open: false, item: null });

    const handleDelete = (role: RoleItem) => {
        setDeleteDialog({ open: true, item: role });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(roles.destroy(deleteDialog.item.id), {
                onSuccess: () => {
                    toast.success('Role deleted successfully.');
                    setDeleteDialog({ open: false, item: null });
                },
            });
        }
    };

    const columns = (() => {
        type Col = NonNullable<DataTableProps<RoleItem, unknown>['columns']>[number];
        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: 'Name',
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => {
                    const role: RoleItem = row.original;
                    return (
                        <span className="font-medium">
                            {role.name}
                            {role.is_system && (
                                <Badge variant="secondary" className="ml-2">
                                    System
                                </Badge>
                            )}
                        </span>
                    );
                },
            } as Col,
            {
                id: 'slug',
                accessorKey: 'slug',
                header: 'Slug',
                enableSorting: false,
                cell: ({ row }: any) => <span>{row.original.slug}</span>,
            } as Col,
            {
                id: 'users_count',
                accessorKey: 'users_count',
                header: 'Users',
                enableSorting: false,
                cell: ({ row }: any) => <span>{row.original.users_count}</span>,
            } as Col,
            {
                id: 'permissions',
                accessorKey: 'permissions',
                header: 'Permissions',
                enableSorting: false,
                cell: ({ row }: any) => {
                    const role: RoleItem = row.original;
                    return (
                        <span>
                            {role.permissions.includes('*')
                                ? 'All'
                                : `${role.permissions.length} routes`}
                        </span>
                    );
                },
            } as Col,
            {
                id: 'actions',
                header: '',
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }: any) => {
                    const role: RoleItem = row.original;
                    if (role.slug === 'owner') {
                        return null;
                    }
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="size-8 p-0">
                                    <EllipsisVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {role.slug !== 'owner' && (
                                    <DropdownMenuItem asChild>
                                        <Link href={roles.edit(role.id)}>
                                            <PenLine className="mr-2 size-4" />
                                            Edit
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                {!role.is_system && (
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => handleDelete(role)}
                                    >
                                        <Trash2 className="mr-2 size-4" />
                                        Delete
                                    </DropdownMenuItem>
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
            <Head title="Roles" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title="Roles & Permissions"
                        description="Manage roles and the routes each role can access."
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 p-0">
                                <EllipsisVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={roles.create()}>
                                    <Plus className="mr-2 size-4" />
                                    Create Role
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <DataTable
                            columns={columns}
                            data={pagination.data}
                            currentPage={pagination.current_page}
                            lastPage={pagination.last_page}
                            total={pagination.total}
                            itemName="roles"
                            baseUrl={roles.index().url}
                            preserveParams={{}}
                            searchable
                            searchPlaceholder="Search roles..."
                            emptyMessage="No roles found."
                            getRowId={(row) => String(row.id)}
                        />
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, item: deleteDialog.item })}
                title="Delete Role"
                description={`Are you sure you want to delete the "${deleteDialog.item?.name}" role? Users assigned to this role will no longer be able to access restricted features.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

RolesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Roles',
            href: roles.index(),
        },
    ],
};