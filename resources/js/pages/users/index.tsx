import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { EllipsisVertical, Eye, Pencil, Plus, RefreshCw, Search, Shield, ShieldOff, X, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { isOwner } from '@/lib/role';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import users from '@/routes/users';
import { useLocale } from '@/contexts/locale-context';

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
    let timer: ReturnType<typeof setTimeout>;
    const debounced = (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
    debounced.cancel = () => clearTimeout(timer);
    return debounced;
}

type PageProps = {
    auth: { user: { role: string } };
    users: {
        data: Array<{
            id: number;
            name: string;
            email: string;
            role: string;
            is_approved: boolean;
            is_owner: boolean;
            assigned_batches_count: number;
        }>;
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
};

export default function UsersIndex({
    users: pagination,
    filters,
    roles = [],
}: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const isAdmin = isOwner(auth.user);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const [refreshing, setRefreshing] = useState(false);

    const assignableRoles = roles.filter((r) => r.slug !== 'owner');

    const roleName = (slug: string) => {
        if (slug === 'inactive') return t('users.inactive');
        return roles.find((r) => r.slug === slug)?.name ?? slug;
    };

    const applyFilters = (extra: Record<string, string> = {}) => {
        const params: Record<string, string> = {
            ...extra,
        };
        if (status) params.status = status;
        if (roleFilter) params.role = roleFilter;
        router.get(users.index(), params, { preserveState: true });
    };

    const debouncedSearch = useCallback(
        debounce((value: string, statusValue: string, roleValue: string) => {
            router.get(users.index(), { search: value, status: statusValue, role: roleValue }, { preserveState: true });
        }, 300),
        [],
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const handleRoleChange = (user: { id: number; role: string; name: string }, value: string) => {
        if (value === user.role) return;
        router.post(users.role(user.id).url, { role: value }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`${user.name} → ${roleName(value)}`);
                router.reload({ only: ['users'] });
            },
        });
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
            router.post(users.deactivate(revokeDialog.item.id).url, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('users.access_revoked'));
                    router.reload({ only: ['users'] });
                },
            });
            setRevokeDialog({ open: false, item: null });
        }
    };

    const handleApprove = (item: { id: number; name: string }) => {
        setApproveDialog({ open: true, item });
    };

    const confirmApprove = () => {
        if (approveDialog.item) {
            router.post(users.approve(approveDialog.item.id).url, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('users.approved'));
                    router.reload({ only: ['users'] });
                },
            });
            setApproveDialog({ open: false, item: null });
        }
    };

    const handleReject = (item: { id: number; name: string }) => {
        setRejectDialog({ open: true, item });
    };

    const confirmReject = () => {
        if (rejectDialog.item) {
            router.post(users.reject(rejectDialog.item.id).url, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('users.approval_revoked'));
                    router.reload({ only: ['users'] });
                },
            });
            setRejectDialog({ open: false, item: null });
        }
    };

    const handleReactivate = (item: { id: number }) => {
        router.post(users.reactivate(item.id).url, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('users.access_restored'));
                router.reload({ only: ['users'] });
            },
        });
    };

    return (
        <>
            <Head title={t('users.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                        <h2 className="text-xl font-semibold tracking-tight">
                            {t('users.title')}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {t('users.desc')}
                        </p>
                    </div>
                    {isAdmin && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8 p-0">
                                    <EllipsisVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={users.create()}>
                                        <Plus className="mr-2 size-4" />
                                        {t('users.create')}
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder={t('actions.search') + '...'}
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        debouncedSearch(e.target.value, status, roleFilter);
                                    }}
                                    className="pr-9 pl-9"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            const params: Record<string, string> = {};
                                            if (status) params.status = status;
                                            if (roleFilter) params.role = roleFilter;
                                            router.get(users.index(), params, { preserveState: true });
                                        }}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Select
                                    value={status || 'all'}
                                    onValueChange={(value) => {
                                        const newStatus = value === 'all' ? '' : value;
                                        setStatus(newStatus);
                                        applyFilters({ status: newStatus });
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[160px]">
                                        <SelectValue placeholder={t('users.all_status')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('users.all_status')}
                                        </SelectItem>
                                        <SelectItem value="active">
                                            {t('users.active')}
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            {t('users.inactive')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={roleFilter || 'all'}
                                    onValueChange={(value) => {
                                        const newRole = value === 'all' ? '' : value;
                                        setRoleFilter(newRole);
                                        applyFilters({ role: newRole });
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder={t('users.filter_by_role')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('users.all_roles')}
                                        </SelectItem>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.slug}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={refreshing}
                                    onClick={() => {
                                        setRefreshing(true);
                                        router.reload({
                                            only: ['users'],
                                            onFinish: () => setRefreshing(false),
                                        });
                                    }}
                                >
                                    <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="sticky left-0 z-10 min-w-[150px] bg-background whitespace-nowrap">
                                        {t('users.name')}
                                    </TableHead>
                                    <TableHead className="whitespace-nowrap">{t('users.email')}</TableHead>
                                    <TableHead className="whitespace-nowrap">{t('users.role')}</TableHead>
                                    <TableHead className="whitespace-nowrap">{t('users.status')}</TableHead>
                                    <TableHead className="whitespace-nowrap">{t('batches.title')}</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            {pagination.data.length === 0 ? (
                                <TableBody>
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center"
                                        >
                                            {t('users.no_users')}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            ) : (
                                <motion.tbody
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        hidden: {},
                                        visible: { transition: { staggerChildren: 0.03 } },
                                    }}
                                >
                                {pagination.data.map((user) => (
                                    <motion.tr
                                        key={user.id}
                                        variants={{
                                            hidden: { opacity: 0, x: -8 },
                                            visible: { opacity: 1, x: 0 },
                                        }}
                                    >
                                            <TableCell className="sticky left-0 z-10 bg-background font-medium whitespace-nowrap">
                                                {user.name}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {user.email}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {user.role === 'inactive' ? (
                                                    <Badge variant="danger">{t('users.inactive')}</Badge>
                                                ) : user.is_owner ? (
                                                    <Badge variant="default">
                                                        <Shield className="mr-1 size-3" />
                                                        {roleName(user.role)}
                                                    </Badge>
                                                ) : isAdmin ? (
                                                    <Select
                                                        value={user.role}
                                                        onValueChange={(value) => handleRoleChange(user, value)}
                                                    >
                                                        <SelectTrigger className="h-7 w-[150px]">
                                                            <SelectValue>{roleName(user.role)}</SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {assignableRoles.map((role) => (
                                                                <SelectItem key={role.id} value={role.slug}>
                                                                    {role.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <span className="capitalize">{roleName(user.role)}</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <Badge variant={user.role === 'inactive' ? 'danger' : 'success'}>
                                                    {user.role === 'inactive' ? t('users.inactive') : t('users.active')}
                                                </Badge>
                                                {user.role !== 'inactive' && !user.is_owner && !user.is_approved && (
                                                    <Badge variant="secondary" className="ml-2">
                                                        {t('users.pending_approval')}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-center">
                                                {user.is_owner ? '-' : user.assigned_batches_count}
                                            </TableCell>
                                            <TableCell className="p-1 text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="size-8 p-0">
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
                                                                {user.role !== 'inactive' && !user.is_approved && (
                                                                    <DropdownMenuItem onClick={() => handleApprove(user)}>
                                                                        <CheckCircle className="mr-2 size-4 text-green-600" />
                                                                        {t('users.approve')}
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {user.role !== 'inactive' && user.is_approved && (
                                                                    <DropdownMenuItem onClick={() => handleReject(user)}>
                                                                        <XCircle className="mr-2 size-4 text-yellow-600" />
                                                                        {t('users.revoke_approval')}
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={users.edit(user.id)}>
                                                                        <Pencil className="mr-2 size-4" />
                                                                        {t('actions.edit')}
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                {user.role === 'inactive' ? (
                                                                    <DropdownMenuItem onClick={() => handleReactivate(user)}>
                                                                        <Shield className="mr-2 size-4 text-green-600" />
                                                                        {t('users.reactivate')}
                                                                    </DropdownMenuItem>
                                                                ) : (
                                                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleRevoke(user)}>
                                                                        <ShieldOff className="mr-2 size-4" />
                                                                        {t('users.revoke_access')}
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                    </motion.tr>
                                ))}
                                </motion.tbody>
                            )}
                        </Table>

                        <Pagination
                            currentPage={pagination.current_page}
                            lastPage={pagination.last_page}
                            total={pagination.total}
                            perPage={pagination.per_page}
                            itemName={t('users.title').toLowerCase() + 's'}
                            baseUrl={users.index().url}
                            preserveParams={{ search, status, role: roleFilter }}
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
                description={t('users.revoke_confirm').replace('{name}', revokeDialog.item?.name ?? '')}
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
                description={t('users.approve_confirm').replace('{name}', approveDialog.item?.name ?? '')}
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
                description={t('users.revoke_approval_confirm').replace('{name}', rejectDialog.item?.name ?? '')}
                confirmText={t('users.revoke_approval')}
                cancelText={t('actions.cancel')}
                variant="destructive"
                onConfirm={confirmReject}
            />
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