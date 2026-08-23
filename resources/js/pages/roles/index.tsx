import { Head, router, usePage } from '@inertiajs/react';
import { EllipsisVertical, PenLine, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable  } from '@/components/data-table';
import type {DataTableProps} from '@/components/data-table';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import RolePermissionsForm from '@/components/role-permissions-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/contexts/locale-context';
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
    groups: Record<string, Record<string, string>>;
};

export default function RolesIndex({ roles: pagination, groups = {} }: PageProps) {
    const { t } = useLocale();
    const { auth, errors } = usePage<PageProps>().props;
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: RoleItem | null;
    }>({ open: false, item: null });
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<RoleItem | null>(null);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [selected, setSelected] = useState<string[]>([]);
    const [processing, setProcessing] = useState(false);

    const handleToggle = (route: string) => {
        setSelected((prev) =>
            prev.includes(route)
                ? prev.filter((r) => r !== route)
                : [...prev, route],
        );
    };

    const handleCreate = () => {
        setEditingItem(null);
        setName('');
        setSlug('');
        setDescription('');
        setSelected([]);
        setSheetOpen(true);
    };

    const handleEdit = (role: RoleItem) => {
        setEditingItem(role);
        setName(role.name);
        setSlug(role.slug);
        setDescription(role.description || '');
        setSelected(role.permissions);
        setSheetOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        if (editingItem) {
            router.put(
                roles.update(editingItem.id),
                { name, description, permissions: selected },
                {
                    onSuccess: () => {
                        toast.success(t('roles.updated'));
                        setSheetOpen(false);
                        setEditingItem(null);
                        setProcessing(false);
                    },
                    onError: (errs) => {
                        toast.error(
                            Object.values(errs)[0] || t('roles.save_error'),
                        );
                        setProcessing(false);
                    },
                },
            );
        } else {
            router.post(
                roles.store(),
                { name, slug, description, permissions: selected },
                {
                    onSuccess: () => {
                        toast.success(t('roles.created'));
                        setSheetOpen(false);
                        setProcessing(false);
                    },
                    onError: (errs) => {
                        toast.error(
                            Object.values(errs)[0] || t('roles.save_error'),
                        );
                        setProcessing(false);
                    },
                },
            );
        }
    };

    const handleDelete = (role: RoleItem) => {
        setDeleteDialog({ open: true, item: role });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            setDeleteDialog({ open: false, item: null });
            router.delete(roles.destroy(deleteDialog.item.id), {
                onSuccess: () => {
                    toast.success('Role deleted successfully.');
                },
                onError: () => {
                    toast.error('Could not delete role. Make sure no users are assigned to it.');
                },
            });
        }
    };

    const columns = (() => {
        type Col = NonNullable<
            DataTableProps<RoleItem, unknown>['columns']
        >[number];

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
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="size-8 p-0"
                                >
                                    <EllipsisVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {role.slug !== 'owner' && (
                                    <DropdownMenuItem
                                        onClick={() => handleEdit(role)}
                                    >
                                        <PenLine className="mr-2 size-4" />
                                        Edit
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
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 p-0"
                            >
                                <EllipsisVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleCreate}>
                                <Plus className="mr-2 size-4" />
                                New Role
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
                onOpenChange={(open) =>
                    setDeleteDialog({ open, item: deleteDialog.item })
                }
                title="Delete Role"
                description={`Are you sure you want to delete the "${deleteDialog.item?.name}" role? Users assigned to this role will no longer be able to access restricted features.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={confirmDelete}
            />

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {editingItem ? `${t('actions.edit')} ${editingItem.name}` : t('actions.create') + ' Role'}
                        </SheetTitle>
                        <SheetDescription>
                            {editingItem
                                ? 'Choose which routes this role can access.'
                                : 'Create a new role and choose which routes it can access.'}
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-4">
                        <div className="space-y-2">
                            <Label htmlFor="sheet-name">Role Name *</Label>
                            <Input
                                id="sheet-name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (!editingItem) {
                                        setSlug(
                                            e.target.value
                                                .toLowerCase()
                                                .trim()
                                                .replace(/[^a-z0-9]+/g, '-')
                                                .replace(/(^-|-$)/g, ''),
                                        );
                                    }
                                }}
                                placeholder="e.g. Teacher"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>
                        {!editingItem && (
                            <div className="space-y-2">
                                <Label htmlFor="sheet-slug">Slug *</Label>
                                <Input
                                    id="sheet-slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="e.g. teacher"
                                    required
                                />
                                <InputError message={errors.slug} />
                            </div>
                        )}
                        {editingItem && (
                            <div className="space-y-2">
                                <Label>Slug</Label>
                                <div className="flex h-9 items-center justify-between rounded-md border bg-muted px-3 text-sm">
                                    <span>{editingItem.slug}</span>
                                    {editingItem.is_system && (
                                        <Badge variant="secondary">
                                            System
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="sheet-description">Description</Label>
                            <Textarea
                                id="sheet-description"
                                rows={2}
                                value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                                placeholder="What can this role do?"
                            />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold">Route Permissions</h3>
                            <RolePermissionsForm
                                groups={groups}
                                selected={selected}
                                onToggle={handleToggle}
                            />
                            <InputError message={errors.permissions} />
                        </div>
                    </form>
                    <SheetFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSheetOpen(false)}
                        >
                            {t('actions.cancel')}
                        </Button>
                        <Button type="submit" disabled={processing} onClick={handleSubmit}>
                            {editingItem ? t('actions.update') : t('actions.create')}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
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
