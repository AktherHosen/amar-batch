import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, EllipsisVertical, PenLine, Shield, ShieldOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable  } from '@/components/data-table';
import type {DataTableProps} from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import UserForm from '@/components/user-form';
import { useLocale } from '@/contexts/locale-context';
import { isOwner } from '@/lib/role';
import batches from '@/routes/batches';
import users from '@/routes/users';

type PageProps = {
    auth: { user: { role: string } };
};

type Batch = {
    id: number;
    name: string;
    subject: string | null;
    enrollments_count: number;
    status: string;
};

type Role = {
    id: number;
    name: string;
    slug: string;
};

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_owner: boolean;
    is_approved: boolean;
    assigned_batches?: Batch[];
    assigned_batches_count?: number;
};

type Branch = {
    id: number;
    name: string;
};

type UsersShowProps = {
    user: User;
    roles?: Role[];
    branches?: Branch[];
};

export default function UsersShow({ user, roles = [], branches = [] }: UsersShowProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const isAdmin = isOwner(auth.user);
    const [revokeDialog, setRevokeDialog] = useState(false);
    const [editSheet, setEditSheet] = useState(false);

    const roleName = (slug: string) => {
        if (slug === 'inactive') {
return t('users.inactive');
}

        return roles.find((r) => r.slug === slug)?.name ?? slug;
    };

    const handleRevoke = () => {
        setRevokeDialog(true);
    };

    const confirmRevoke = () => {
        router.post(users.deactivate(user.id).url, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('users.access_revoked'));
                router.reload({ only: ['user'] });
            },
        });
        setRevokeDialog(false);
    };

    const columns = (() => {
        type Col = NonNullable<DataTableProps<Batch, unknown>['columns']>[number];

        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: t('batches.name'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">{row.original.name}</span>
                ),
            } as Col,
            {
                id: 'subject',
                accessorKey: 'subject',
                header: t('batches.subject'),
                enableSorting: true,
                cell: ({ row }: any) => row.original.subject || '-',
            } as Col,
            {
                id: 'enrollments_count',
                accessorKey: 'enrollments_count',
                header: t('batches.enrolled'),
                enableSorting: false,
                cell: ({ row }: any) => <span>{row.original.enrollments_count}</span>,
            } as Col,
            {
                id: 'status',
                accessorKey: 'status',
                header: t('students.status'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const batch: Batch = row.original;

                    return (
                        <Badge
                            variant={
                                batch.status === 'active'
                                    ? 'default'
                                    : batch.status === 'inactive'
                                      ? 'secondary'
                                      : 'destructive'
                            }
                        >
                            {batch.status}
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
                    const batch: Batch = row.original;

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="size-8 p-0">
                                    <EllipsisVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={batches.show(batch.id)}>
                                        {t('actions.view')}
                                    </Link>
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
            <Head title={user.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <Link href={users.index()} className="shrink-0">
                            <Button variant="ghost" size="icon" className="size-9">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <h1 className="truncate text-lg font-bold tracking-tight sm:text-2xl">{user.name}</h1>
                    </div>
                    {isAdmin && !user.is_owner && (
                        <div className="flex gap-2 shrink-0">
                            <Button variant="outline" className="h-9" onClick={() => setEditSheet(true)}>
                                <PenLine className="size-4" />
                                <span className="ml-2 hidden sm:inline">{t('actions.edit')}</span>
                            </Button>
                            {user.role === 'inactive' ? (
                                <Button onClick={() =>
                                    router.post(users.reactivate(user.id).url, {}, {
                                        onSuccess: () => toast.success(t('users.access_restored')),
                                    })
                                }>
                                    <Shield className="mr-2 size-4" />
                                    {t('users.reactivate')}
                                </Button>
                            ) : (
                                <Button variant="destructive" onClick={handleRevoke}>
                                    <ShieldOff className="size-4" />
                                    <span className="ml-2 hidden sm:inline">{t('users.revoke_access')}</span>
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('users.profile')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Badge variant={user.role === 'inactive' ? 'danger' : 'success'}>
                                {user.role === 'inactive' ? t('users.inactive') : t('users.active')}
                            </Badge>
                            <Badge variant={user.is_owner ? 'default' : 'secondary'}>
                                {roleName(user.role)}
                            </Badge>
                            {!user.is_owner && user.role !== 'inactive' && (
                                <Badge variant={user.is_approved ? 'success' : 'danger'}>
                                    {user.is_approved ? t('users.approved') : t('users.pending_approval')}
                                </Badge>
                            )}
                        </div>
                        <div className="grid w-full grid-cols-2 gap-3">
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    {t('users.name')}
                                </p>
                                <p className="truncate text-sm font-medium">{user.name}</p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    {t('users.email')}
                                </p>
                                <p className="truncate text-sm font-medium">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    {t('users.role')}
                                </p>
                                <p className="text-sm font-medium capitalize">{roleName(user.role)}</p>
                            </div>
                            {user.role === 'teacher' && (
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('batches.title')}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {user.assigned_batches_count}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {user.role === 'teacher' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('batches.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <DataTable
                            columns={columns}
                            data={user.assigned_batches ?? []}
                            searchable
                            searchPlaceholder={t('batches.title') + '...'}
                            emptyMessage={t('users.no_batches')}
                            getRowId={(row) => String(row.id)}
                        />
                        </CardContent>
                    </Card>
                )}
            </div>

            <ConfirmDialog
                open={revokeDialog}
                onOpenChange={setRevokeDialog}
                title={t('users.revoke_title')}
                description={t('users.revoke_confirm').replace('{name}', user.name)}
                confirmText={t('users.revoke_access')}
                cancelText={t('actions.cancel')}
                variant="destructive"
                onConfirm={confirmRevoke}
            />

            <Sheet open={editSheet} onOpenChange={setEditSheet}>
                <SheetContent className="w-full sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>{t('actions.edit')} {user.name}</SheetTitle>
                    </SheetHeader>
                    <UserForm
                        user={user}
                        roles={roles}
                        branches={branches}
                        onSubmit={(data) => {
                            data.append('_method', 'PUT');
                            router.post(users.update(user.id), data, {
                                preserveScroll: true,
                                onSuccess: () => {
                                    toast.success(t('users.updated'));
                                    setEditSheet(false);
                                    router.reload({ only: ['users'] });
                                },
                            });
                        }}
                        onCancel={() => setEditSheet(false)}
                    />
                </SheetContent>
            </Sheet>
        </>
    );
}

UsersShow.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: users.index(),
        },
        {
            title: 'View',
            href: '#',
        },
    ],
};