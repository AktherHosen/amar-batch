import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { EllipsisVertical, PenLine, Plus, Shield, Trash2 } from 'lucide-react';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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

    return (
        <>
            <Head title="Roles" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                        <h2 className="text-xl font-semibold tracking-tight">
                            Roles & Permissions
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Manage roles and the routes each role can access.
                        </p>
                    </div>
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
                        {pagination.data.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-4">
                                <Shield className="size-8 text-muted-foreground" />
                                <p>No roles found.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="sticky left-0 z-10 min-w-[150px] bg-background whitespace-nowrap">
                                            Name
                                        </TableHead>
                                        <TableHead className="whitespace-nowrap">Slug</TableHead>
                                        <TableHead className="whitespace-nowrap">Users</TableHead>
                                        <TableHead className="whitespace-nowrap">Permissions</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <motion.tbody
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        hidden: {},
                                        visible: { transition: { staggerChildren: 0.03 } },
                                    }}
                                >
                                    {pagination.data.map((role) => (
                                        <motion.tr
                                            key={role.id}
                                            variants={{
                                                hidden: { opacity: 0, x: -8 },
                                                visible: { opacity: 1, x: 0 },
                                            }}
                                        >
                                            <TableCell className="sticky left-0 z-10 bg-background font-medium whitespace-nowrap">
                                                {role.name}
                                                {role.is_system && (
                                                    <Badge variant="secondary" className="ml-2">
                                                        System
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {role.slug}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {role.users_count}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {role.permissions.includes('*')
                                                    ? 'All'
                                                    : `${role.permissions.length} routes`}
                                            </TableCell>
                                            <TableCell className="p-1 text-center">
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
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </motion.tbody>
                            </Table>
                        )}
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