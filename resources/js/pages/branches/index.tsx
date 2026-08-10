import Heading from '@/components/heading';
import { isOwner } from '@/lib/role';
import Pagination from '@/components/pagination';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useLocale } from '@/contexts/locale-context';
import branches from '@/routes/branches';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { EllipsisVertical, Eye, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';

type Branch = {
    id: number;
    name: string;
    code: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    is_active: boolean;
};

type PageProps = {
    branches: {
        data: Branch[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: { search?: string };
};

export default function BranchesIndex({ branches: pagination, filters }: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage().props;
    const isAdmin = isOwner(auth.user);
    const [search, setSearch] = useState(filters.search || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Branch | null }>({ open: false, item: null });

    const handleSearch = () => {
        router.get(branches.index(), { search }, { preserveState: true });
    };

    const handleRefresh = () => {
        setRefreshing(true);
        router.reload({ onFinish: () => setRefreshing(false) });
    };

    const handleDelete = (branch: Branch) => {
        setDeleteDialog({ open: true, item: branch });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(branches.destroy(deleteDialog.item.id));
            toast.success(t('branches.deleted'));
            setDeleteDialog({ open: false, item: null });
        }
    };

    return (
        <>
            <Head title={t('branches.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading title={t('branches.title')} description={t('branches.desc')} />
                    {isAdmin && (
                        <Link href={branches.create()}>
                            <Button size="sm">
                                <Plus className="mr-2 size-4" />
                                {t('branches.create')}
                            </Button>
                        </Link>
                    )}
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder={t('actions.search') + '...'}
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                {search && (
                                    <button
                                        onClick={() => {
                                            setSearch('');
                                            router.get(branches.index(), {}, { preserveState: true });
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        <X className="size-4 text-muted-foreground hover:text-foreground" />
                                    </button>
                                )}
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleRefresh}>
                                <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="sticky left-0 z-10 min-w-[150px] bg-background">{t('branches.name')}</TableHead>
                                    <TableHead>{t('branches.code')}</TableHead>
                                    <TableHead>{t('branches.address')}</TableHead>
                                    <TableHead>{t('branches.phone')}</TableHead>
                                    <TableHead>{t('branches.status')}</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pagination.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            {t('branches.no_branches')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pagination.data.map((branch) => (
                                        <TableRow key={branch.id}>
                                            <TableCell className="sticky left-0 z-10 min-w-[150px] bg-background font-medium whitespace-nowrap">
                                                {branch.name}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{branch.code || '-'}</TableCell>
                                            <TableCell className="whitespace-nowrap">{branch.address || '-'}</TableCell>
                                            <TableCell className="whitespace-nowrap">{branch.phone || '-'}</TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <Badge className={branch.is_active ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                                                    {branch.is_active ? t('branches.active') : t('branches.inactive')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="p-1 text-center whitespace-nowrap">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="size-8 p-0">
                                                            <EllipsisVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => router.get(branches.show(branch.id))}>
                                                            <Eye className="mr-2 size-4" />
                                                            {t('actions.view')}
                                                        </DropdownMenuItem>
                                                        {isAdmin && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => router.get(branches.edit(branch.id))}>
                                                                    <Pencil className="mr-2 size-4" />
                                                                    {t('actions.edit')}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(branch)}>
                                                                    <Trash2 className="mr-2 size-4" />
                                                                    {t('actions.delete')}
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        <Pagination
                            currentPage={pagination.current_page}
                            lastPage={pagination.last_page}
                            total={pagination.total}
                            perPage={pagination.per_page}
                            itemName={t('branches.title').toLowerCase() + 'es'}
                            baseUrl={branches.index()}
                            preserveParams={{ search }}
                        />
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
                title={t('confirm.are_you_sure')}
                description={t('branches.delete_confirm')}
                confirmText={t('confirm.delete')}
                onConfirm={confirmDelete}
            />
        </>
    );
}

BranchesIndex.layout = {
    breadcrumbs: [{ title: 'Branches', href: branches.index() }],
};
