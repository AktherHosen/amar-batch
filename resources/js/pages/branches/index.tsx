import CellTitle from '@/components/cell-title';
import { useLocale } from '@/contexts/locale-context';
import branches from '@/routes/branches';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { EllipsisVertical, Eye, PenLine, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable, type DataTableProps } from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PageActions from '@/components/page-actions';
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
import { isOwner } from '@/lib/role';

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

export default function BranchesIndex({
    branches: pagination,
    filters,
}: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage().props;
    const isAdmin = isOwner(auth.user);
    const [search, setSearch] = useState(filters.search || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: Branch | null;
    }>({ open: false, item: null });
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Branch | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        code: '',
        address: '',
        phone: '',
        email: '',
    });

    const handleCreate = () => {
        setEditingItem(null);
        reset();
        setData({ name: '', code: '', address: '', phone: '', email: '' });
        setSheetOpen(true);
    };

    const handleEdit = (branch: Branch) => {
        setEditingItem(branch);
        setData({
            name: branch.name,
            code: branch.code || '',
            address: branch.address || '',
            phone: branch.phone || '',
            email: branch.email || '',
        });
        setSheetOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            put(branches.update(editingItem.id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Branch updated successfully.');
                    setSheetOpen(false);
                    setEditingItem(null);
                },
            });
        } else {
            post(branches.store(), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Branch created successfully.');
                    setSheetOpen(false);
                },
            });
        }
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            branches.index(),
            { search: value },
            { preserveState: true },
        );
    };

    const handleRefresh = () => {
        setRefreshing(true);
        router.reload({ onFinish: () => setRefreshing(false) });
    };

    const clearAll = () => {
        setSearch('');
        router.get(branches.index(), {}, { preserveState: true });
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

    const columns = (() => {
        type Col = NonNullable<
            DataTableProps<Branch, unknown>['columns']
        >[number];

        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: t('branches.name'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <CellTitle
                        title={row.original.name}
                        href={branches.show(row.original.id).url}
                    />
                ),
            } as Col,
            {
                id: 'code',
                accessorKey: 'code',
                header: t('branches.code'),
                enableSorting: false,
                cell: ({ row }: any) => row.original.code || '-',
            } as Col,
            {
                id: 'address',
                accessorKey: 'address',
                header: t('branches.address'),
                enableSorting: false,
                cell: ({ row }: any) => row.original.address || '-',
            } as Col,
            {
                id: 'phone',
                accessorKey: 'phone',
                header: t('branches.phone'),
                enableSorting: false,
                cell: ({ row }: any) => row.original.phone || '-',
            } as Col,
            {
                id: 'status',
                accessorKey: 'is_active',
                header: t('branches.status'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const branch: Branch = row.original;

                    return (
                        <Badge
                            variant={branch.is_active ? 'success' : 'danger'}
                        >
                            {branch.is_active
                                ? t('branches.active')
                                : t('branches.inactive')}
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
                    const branch: Branch = row.original;

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
                                <DropdownMenuItem
                                    onClick={() =>
                                        router.get(branches.show(branch.id))
                                    }
                                >
                                    <Eye className="mr-2 size-4" />
                                    {t('actions.view')}
                                </DropdownMenuItem>
                                {isAdmin && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() => handleEdit(branch)}
                                        >
                                            <PenLine className="mr-2 size-4" />
                                            {t('actions.edit')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => handleDelete(branch)}
                                        >
                                            <Trash2 className="mr-2 size-4" />
                                            {t('actions.delete')}
                                        </DropdownMenuItem>
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
            <Head title={t('branches.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('branches.title')}
                        description={t('branches.desc')}
                    />
                    <div className="flex items-center gap-1">
                        <RefreshButton
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                        />
                        <PageActions
                            isAdmin={isAdmin}
                            createLabel={t('branches.create')}
                            onCreate={handleCreate}
                            exportTitle="Branches"
                            exportFilename="branches"
                            exportHeaders={[
                                'Name',
                                'Code',
                                'Address',
                                'Phone',
                                'Email',
                            ]}
                            exportRows={pagination.data.map((b) => [
                                b.name,
                                b.code || '',
                                b.address || '',
                                b.phone || '',
                                b.email || '',
                            ])}
                            importUrl="/branches/import"
                            importFields={[
                                'name',
                                'code',
                                'address',
                                'phone',
                                'email',
                            ]}
                            onImportSuccess={() =>
                                router.reload({ only: ['branches'] })
                            }
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
                            itemName={t('branches.title').toLowerCase()}
                            baseUrl={branches.index().url}
                            preserveParams={{ search }}
                            emptyMessage={t('branches.no_branches')}
                            getRowId={(row) => String(row.id)}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder={
                                        t('actions.search') + '...'
                                    }
                                    searchValue={search}
                                    onSearchChange={handleSearch}
                                    activeFilterCount={search ? 1 : 0}
                                    onClearAll={clearAll}
                                />
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    setDeleteDialog({ ...deleteDialog, open })
                }
                title={t('confirm.are_you_sure')}
                description={t('branches.delete_confirm')}
                confirmText={t('confirm.delete')}
                onConfirm={confirmDelete}
            />

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {editingItem ? t('branches.edit') : t('branches.create')}
                        </SheetTitle>
                        <SheetDescription>
                            {editingItem
                                ? t('branches.update_details')
                                : t('branches.create')}
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-4">
                        <div className="space-y-2">
                            <Label htmlFor="sheet-name">
                                {t('branches.name')} *
                            </Label>
                            <Input
                                id="sheet-name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder={t('branches.name_placeholder')}
                            />
                            <InputError message={errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sheet-code">
                                {t('branches.code')}
                            </Label>
                            <Input
                                id="sheet-code"
                                value={data.code}
                                onChange={(e) =>
                                    setData('code', e.target.value)
                                }
                                placeholder={t('branches.code_placeholder')}
                            />
                            <InputError message={errors.code} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sheet-address">
                                {t('branches.address')}
                            </Label>
                            <Textarea
                                id="sheet-address"
                                value={data.address}
                                onChange={(e) =>
                                    setData('address', e.target.value)
                                }
                            />
                            <InputError message={errors.address} />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="sheet-phone">
                                    {t('branches.phone')}
                                </Label>
                                <Input
                                    id="sheet-phone"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                />
                                <InputError message={errors.phone} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sheet-email">
                                    {t('branches.email')}
                                </Label>
                                <Input
                                    id="sheet-email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                />
                                <InputError message={errors.email} />
                            </div>
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
                            {processing
                                ? editingItem
                                    ? t('actions.updating')
                                    : t('actions.creating')
                                : editingItem
                                  ? t('actions.update')
                                  : t('actions.create')}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}

BranchesIndex.layout = {
    breadcrumbs: [{ title: 'Branches', href: branches.index() }],
};
