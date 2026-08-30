import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    EllipsisVertical,
    Eye,
    PenLine,
    Plus,
    Shield,
    ShieldOff,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable  } from '@/components/data-table';
import type {DataTableProps} from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import Heading from '@/components/heading';
import { RefreshButton } from '@/components/refresh-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import UserForm from '@/components/user-form';
import { useLocale } from '@/contexts/locale-context';
import { useHasFeature } from '@/lib/features';
import { isOwner } from '@/lib/role';
import users from '@/routes/users';

type UserRow = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_approved: boolean;
    is_owner: boolean;
    branch: { id: number; name: string } | null;
};

type PageProps = {
    auth: { user: { role: string } };
    users: {
        data: UserRow[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        role?: string;
    };
    roles: Array<{
        id: number;
        name: string;
        slug: string;
    }>;
    branches: Array<{
        id: number;
        name: string;
    }>;
};

type EditUser = {
    id: number;
    name: string;
    email: string;
    role: string;
    branch_id?: number | null;
    avatar?: string | null;
};

export default function UsersIndex({
    users: pagination,
    filters,
    roles = [],
    branches = [],
}: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const isAdmin = isOwner(auth.user);
    const hasMultiBranch = useHasFeature('multi_branch');
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const [refreshing, setRefreshing] = useState(false);
    const [editSheet, setEditSheet] = useState<{ open: boolean; user: EditUser | null }>({
        open: false,
        user: null,
    });
    const [createSheet, setCreateSheet] = useState(false);

    const assignableRoles = roles.filter((r) => r.slug !== 'owner');

    const roleName = (slug: string) => {
        if (slug === 'inactive') {
return t('users.inactive');
}

        return roles.find((r) => r.slug === slug)?.name ?? slug;
    };

    const applyFilters = (extra: Record<string, string> = {}) => {
        const params: Record<string, string> = {
            ...extra,
        };

        if (status) {
params.status = status;
}

        if (roleFilter) {
params.role = roleFilter;
}

        router.get(users.index(), params, { preserveState: true });
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            users.index(),
            { search: value, status, role: roleFilter },
            { preserveState: true },
        );
    };

    const clearAll = () => {
        setSearch('');
        setStatus('');
        setRoleFilter('');
        router.get(users.index(), {}, { preserveState: true });
    };

    const activeFilterCount = (status ? 1 : 0) + (roleFilter ? 1 : 0);

    const handleRoleChange = (
        user: { id: number; role: string; name: string },
        value: string,
    ) => {
        if (value === user.role) {
return;
}

        router.post(
            users.role(user.id).url,
            { role: value },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`${user.name} → ${roleName(value)}`);
                    router.reload({ only: ['users'] });
                },
            },
        );
    };

    const [revokeDialog, setRevokeDialog] = useState<{
        open: boolean;
        item: { id: number; name: string } | null;
    }>({ open: false, item: null });
    const [approveDialog, setApproveDialog] = useState<{
        open: boolean;
        item: { id: number; name: string } | null;
    }>({ open: false, item: null });
    const [rejectDialog, setRejectDialog] = useState<{
        open: boolean;
        item: { id: number; name: string } | null;
    }>({ open: false, item: null });

    const handleRevoke = (item: { id: number; name: string }) => {
        setRevokeDialog({ open: true, item });
    };

    const confirmRevoke = () => {
        if (revokeDialog.item) {
            router.post(
                users.deactivate(revokeDialog.item.id).url,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(t('users.access_revoked'));
                        router.reload({ only: ['users'] });
                    },
                },
            );
            setRevokeDialog({ open: false, item: null });
        }
    };

    const handleApprove = (item: { id: number; name: string }) => {
        setApproveDialog({ open: true, item });
    };

    const confirmApprove = () => {
        if (approveDialog.item) {
            router.post(
                users.approve(approveDialog.item.id).url,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(t('users.approved'));
                        router.reload({ only: ['users'] });
                    },
                },
            );
            setApproveDialog({ open: false, item: null });
        }
    };

    const handleReject = (item: { id: number; name: string }) => {
        setRejectDialog({ open: true, item });
    };

    const confirmReject = () => {
        if (rejectDialog.item) {
            router.post(
                users.reject(rejectDialog.item.id).url,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(t('users.approval_revoked'));
                        router.reload({ only: ['users'] });
                    },
                },
            );
            setRejectDialog({ open: false, item: null });
        }
    };

    const handleReactivate = (item: { id: number }) => {
        router.post(
            users.reactivate(item.id).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('users.access_restored'));
                    router.reload({ only: ['users'] });
                },
            },
        );
    };

    const columns = (() => {
        type Col = NonNullable<
            DataTableProps<UserRow, unknown>['columns']
        >[number];

        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: t('users.name'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">{row.original.name}</span>
                ),
            } as Col,
            {
                id: 'email',
                accessorKey: 'email',
                header: t('users.email'),
                enableSorting: true,
                cell: ({ row }: any) => <span>{row.original.email}</span>,
            } as Col,
            ...(hasMultiBranch
                ? [
                      {
                          id: 'branch',
                          accessorKey: 'branch.name',
                          header: 'Branch',
                          enableSorting: false,
                          cell: ({ row }: any) =>
                              row.original.branch?.name ?? (
                                  <span className="text-muted-foreground">
                                      All
                                  </span>
                              ),
                      } as Col,
                  ]
                : []),
            {
                id: 'role',
                accessorKey: 'role',
                header: t('users.role'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const user: UserRow = row.original;

                    if (user.role === 'inactive') {
                        return (
                            <Badge variant="danger">
                                {t('users.inactive')}
                            </Badge>
                        );
                    }

                    if (user.is_owner) {
                        return (
                            <Badge variant="default">
                                <Shield className="mr-1 size-3" />
                                {roleName(user.role)}
                            </Badge>
                        );
                    }

                    if (isAdmin) {
                        return (
                            <Select
                                value={user.role}
                                onValueChange={(value) =>
                                    handleRoleChange(user, value)
                                }
                            >
                                <SelectTrigger className="h-7 w-auto min-w-[110px]">
                                    <SelectValue>
                                        {roleName(user.role)}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {assignableRoles.map((role) => (
                                        <SelectItem
                                            key={role.id}
                                            value={role.slug}
                                        >
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        );
                    }

                    return (
                        <span className="capitalize">
                            {roleName(user.role)}
                        </span>
                    );
                },
            } as Col,
            {
                id: 'status',
                accessorKey: 'status',
                header: t('users.status'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const user: UserRow = row.original;

                    if (user.role === 'inactive') {
                        return (
                            <Badge variant="danger">
                                {t('users.inactive')}
                            </Badge>
                        );
                    }

                    if (!user.is_owner && !user.is_approved) {
                        return (
                            <Badge variant="secondary">
                                {t('users.pending_approval')}
                            </Badge>
                        );
                    }

                    return <Badge variant="success">{t('users.active')}</Badge>;
                },
            } as Col,
            {
                id: 'actions',
                header: '',
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }: any) => {
                    const user: UserRow = row.original;

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
                                <DropdownMenuItem asChild>
                                    <Link href={users.show(user.id)}>
                                        <Eye className="mr-2 size-4" />
                                        {t('actions.view')}
                                    </Link>
                                </DropdownMenuItem>
                                {isAdmin && !user.is_owner && (
                                    <>
                                        {user.role !== 'inactive' &&
                                            !user.is_approved && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleApprove(user)
                                                    }
                                                >
                                                    <CheckCircle className="mr-2 size-4 text-green-600" />
                                                    {t('users.approve')}
                                                </DropdownMenuItem>
                                            )}
                                        {user.role !== 'inactive' &&
                                            user.is_approved && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleReject(user)
                                                    }
                                                >
                                                    <XCircle className="mr-2 size-4 text-yellow-600" />
                                                    {t('users.revoke_approval')}
                                                </DropdownMenuItem>
                                            )}
                                        <DropdownMenuItem
                                            onClick={() =>
                                                setEditSheet({ open: true, user: user })
                                            }
                                        >
                                            <PenLine className="mr-2 size-4" />
                                            {t('actions.edit')}
                                        </DropdownMenuItem>
                                        {user.role === 'inactive' ? (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleReactivate(user)
                                                }
                                            >
                                                <Shield className="mr-2 size-4 text-green-600" />
                                                {t('users.reactivate')}
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() =>
                                                    handleRevoke(user)
                                                }
                                            >
                                                <ShieldOff className="mr-2 size-4" />
                                                {t('users.revoke_access')}
                                            </DropdownMenuItem>
                                        )}
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
            <Head title={t('users.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title={t('users.title')}
                        description={t('users.desc')}
                    />
                    <div className="flex items-center gap-1">
                        {isAdmin && (
                            <RefreshButton
                                refreshing={refreshing}
                                onRefresh={() => {
                                    setRefreshing(true);
                                    router.reload({
                                        only: ['users'],
                                        onFinish: () => setRefreshing(false),
                                    });
                                }}
                            />
                        )}
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
                                    <DropdownMenuItem
                                        onClick={() =>
                                            setCreateSheet(true)
                                        }
                                    >
                                        <Plus className="mr-2 size-4" />
                                        {t('users.create')}
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
                            itemName={t('users.title').toLowerCase()}
                            baseUrl={users.index().url}
                            preserveParams={{
                                search,
                                status,
                                role: roleFilter,
                            }}
                            emptyMessage={t('users.no_users')}
                            getRowId={(row) => String(row.id)}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder={
                                        t('actions.search') + '...'
                                    }
                                    searchValue={search}
                                    onSearchChange={handleSearch}
                                    activeFilterCount={activeFilterCount}
                                    onClearAll={clearAll}
                                    filters={[
                                        {
                                            id: 'status',
                                            placeholder: t('users.all_status'),
                                            value: status,
                                            options: [
                                                {
                                                    label: t('users.active'),
                                                    value: 'active',
                                                },
                                                {
                                                    label: t('users.inactive'),
                                                    value: 'inactive',
                                                },
                                            ],
                                            onValueChange: (value) => {
                                                setStatus(value);
                                                applyFilters({ status: value });
                                            },
                                        },
                                        {
                                            id: 'role',
                                            placeholder: t('users.all_roles'),
                                            value: roleFilter,
                                            options: roles.map((role) => ({
                                                label: role.name,
                                                value: role.slug,
                                            })),
                                            onValueChange: (value) => {
                                                setRoleFilter(value);
                                                applyFilters({ role: value });
                                            },
                                        },
                                    ]}
                                />
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={revokeDialog.open}
                onOpenChange={(open) =>
                    setRevokeDialog({ open, item: revokeDialog.item })
                }
                title={t('users.revoke_title')}
                description={t('users.revoke_confirm').replace(
                    '{name}',
                    revokeDialog.item?.name ?? '',
                )}
                confirmText={t('users.revoke_access')}
                cancelText={t('actions.cancel')}
                variant="destructive"
                onConfirm={confirmRevoke}
            />

            <ConfirmDialog
                open={approveDialog.open}
                onOpenChange={(open) =>
                    setApproveDialog({ open, item: approveDialog.item })
                }
                title={t('users.approve_title')}
                description={t('users.approve_confirm').replace(
                    '{name}',
                    approveDialog.item?.name ?? '',
                )}
                confirmText={t('users.approve')}
                cancelText={t('actions.cancel')}
                onConfirm={confirmApprove}
            />

            <ConfirmDialog
                open={rejectDialog.open}
                onOpenChange={(open) =>
                    setRejectDialog({ open, item: rejectDialog.item })
                }
                title={t('users.revoke_approval_title')}
                description={t('users.revoke_approval_confirm').replace(
                    '{name}',
                    rejectDialog.item?.name ?? '',
                )}
                confirmText={t('users.revoke_approval')}
                cancelText={t('actions.cancel')}
                variant="destructive"
                onConfirm={confirmReject}
            />

            <Sheet open={editSheet.open} onOpenChange={(open) => setEditSheet({ open, user: editSheet.user })}>
                <SheetContent className="w-full sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>{t('actions.edit')} {editSheet.user?.name}</SheetTitle>
                    </SheetHeader>
                    {editSheet.user && (
                        <UserForm
                            user={editSheet.user}
                            roles={roles}
                            branches={branches}
                            onSubmit={(data) => {
                                data.append('_method', 'PUT');
                                router.post(users.update(editSheet.user!.id), data, {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        toast.success(t('users.updated'));
                                        setEditSheet({ open: false, user: null });
                                        router.reload({ only: ['users'] });
                                    },
                                });
                            }}
                            onCancel={() => setEditSheet({ open: false, user: null })}
                        />
                    )}
                </SheetContent>
            </Sheet>

            <Sheet open={createSheet} onOpenChange={setCreateSheet}>
                <SheetContent className="w-full sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>{t('users.create')}</SheetTitle>
                    </SheetHeader>
                    <UserForm
                        roles={roles}
                        branches={branches}
                        onSubmit={(data) => {
                            router.post(users.store(), data, {
                                preserveScroll: true,
                                onSuccess: () => {
                                    toast.success(t('users.created'));
                                    setCreateSheet(false);
                                    router.reload({ only: ['users'] });
                                },
                            });
                        }}
                        onCancel={() => setCreateSheet(false)}
                    />
                </SheetContent>
            </Sheet>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: users.index(),
        },
    ],
};
