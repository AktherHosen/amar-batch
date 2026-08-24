import { router } from '@inertiajs/react';
import { EllipsisVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import type { DataTableProps } from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import Heading from '@/components/heading';
import { RefreshButton } from '@/components/refresh-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/contexts/locale-context';

type Plan = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price_monthly: number;
    price_yearly: number;
    max_students: number;
    max_staff: number;
    max_batches: number;
    features: string[] | null;
    is_active: boolean;
    is_default: boolean;
};

type PageProps = {
    plans: {
        data: Plan[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
};

const AVAILABLE_FEATURES = [
    'students',
    'batches',
    'attendance',
    'fees',
    'exams',
    'reports',
    'notifications',
    'custom_branding',
    'multi_branch',
    'api_access',
];

const defaultForm = {
    name: '',
    slug: '',
    description: '',
    price_monthly: 0,
    price_yearly: 0,
    max_students: 50,
    max_staff: 5,
    max_batches: 10,
    features: [] as string[],
    is_active: true,
    is_default: false,
};

export default function PlansIndex({ plans: pagination, filters }: PageProps) {
    const { t, formatCurrency } = useLocale();
    const [search, setSearch] = useState(filters.search || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Plan | null }>({
        open: false,
        item: null,
    });
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [form, setForm] = useState(defaultForm);
    const [processing, setProcessing] = useState(false);

    const openCreate = () => {
        setEditingPlan(null);
        setForm(defaultForm);
        setSheetOpen(true);
    };

    const openEdit = (plan: Plan) => {
        setEditingPlan(plan);
        setForm({
            name: plan.name,
            slug: plan.slug,
            description: plan.description || '',
            price_monthly: plan.price_monthly,
            price_yearly: plan.price_yearly,
            max_students: plan.max_students,
            max_staff: plan.max_staff,
            max_batches: plan.max_batches,
            features: plan.features || [],
            is_active: plan.is_active,
            is_default: plan.is_default,
        });
        setSheetOpen(true);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        if (editingPlan) {
            router.put(`/dashboard/plans/${editingPlan.id}`, form, {
                onSuccess: () => {
                    toast.success(t('toast.updated_successfully'));
                    setSheetOpen(false);
                },
                onFinish: () => setProcessing(false),
            });
        } else {
            router.post('/dashboard/plans', form, {
                onSuccess: () => {
                    toast.success(t('toast.created_successfully'));
                    setSheetOpen(false);
                },
                onFinish: () => setProcessing(false),
            });
        }
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const toggleFeature = (feature: string) => {
        setForm((prev) => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter((f) => f !== feature)
                : [...prev.features, feature],
        }));
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get('/dashboard/plans', { search: value }, { preserveState: true });
    };

    const handleDelete = (plan: Plan) => {
        setDeleteDialog({ open: true, item: plan });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(`/dashboard/plans/${deleteDialog.item.id}`);
            toast.success(t('toast.deleted_successfully'));
            setDeleteDialog({ open: false, item: null });
        }
    };

    const formatLimit = (value: number) => (value === -1 ? t('super_admin.unlimited') : value.toString());

    const columns: NonNullable<DataTableProps<Plan, unknown>['columns']> = [
        {
            id: 'name',
            accessorKey: 'name',
            header: t('super_admin.plans'),
            enableSorting: true,
            meta: { sticky: true },
            cell: ({ row }: any) => (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{row.original.name}</span>
                    {row.original.is_default && (
                        <Badge variant="secondary" className="text-xs">{t('super_admin.default_plan')}</Badge>
                    )}
                </div>
            ),
        },
        {
            id: 'price',
            accessorKey: 'price_monthly',
            header: t('super_admin.monthly_price'),
            enableSorting: true,
            cell: ({ row }: any) => (
                <span className="font-semibold">
                    {row.original.price_monthly === 0 ? 'Free' : formatCurrency(row.original.price_monthly)}
                </span>
            ),
        },
        {
            id: 'students',
            accessorKey: 'max_students',
            header: t('super_admin.students'),
            enableSorting: false,
            cell: ({ row }: any) => formatLimit(row.original.max_students),
        },
        {
            id: 'staff',
            accessorKey: 'max_staff',
            header: t('super_admin.users'),
            enableSorting: false,
            cell: ({ row }: any) => formatLimit(row.original.max_staff),
        },
        {
            id: 'batches',
            accessorKey: 'max_batches',
            header: t('super_admin.batches'),
            enableSorting: false,
            cell: ({ row }: any) => formatLimit(row.original.max_batches),
        },
        {
            id: 'features',
            accessorKey: 'features',
            header: t('super_admin.features'),
            enableSorting: false,
            cell: ({ row }: any) => {
                const features = row.original.features;
                if (!features || features.length === 0) return '—';
                return (
                    <div className="flex flex-wrap gap-1">
                        {features.slice(0, 3).map((f: string) => (
                            <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                        ))}
                        {features.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{features.length - 3}</Badge>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: '',
            enableSorting: false,
            enableHiding: false,
            cell: ({ row }: any) => {
                const plan: Plan = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="size-8 p-0">
                                <EllipsisVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(plan)}>
                                <Pencil className="mr-2 size-4" />
                                {t('actions.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(plan)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 size-4" />
                                {t('actions.delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-3 sm:p-4">
                <div className="flex items-start justify-between">
                    <Heading title={t('super_admin.plans')} description={t('super_admin.manage_plans')} />
                    <div className="flex items-center gap-1">
                        <RefreshButton
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                router.reload({ only: ['plans'], onFinish: () => setRefreshing(false) });
                            }}
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="size-8 p-0">
                                    <EllipsisVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={openCreate}>
                                    <Plus className="mr-2 size-4" />
                                    {t('actions.create')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                            itemName="plans"
                            baseUrl="/dashboard/plans"
                            preserveParams={{ search }}
                            emptyMessage={t('super_admin.no_payments')}
                            getRowId={(row) => String(row.id)}
                            enableColumnVisibility={false}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder={`${t('actions.search')}...`}
                                    searchValue={search}
                                    onSearchChange={handleSearch}
                                    activeFilterCount={0}
                                    onClearAll={() => handleSearch('')}
                                />
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{editingPlan ? t('super_admin.edit_plan') : t('super_admin.create_plan')}</SheetTitle>
                        <SheetDescription>
                            {editingPlan ? `${t('actions.update')} ${editingPlan.name}` : t('super_admin.manage_plans')}
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 px-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">{t('super_admin.plan_name')}</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) => {
                                    const name = e.target.value;
                                    setForm((prev) => ({
                                        ...prev,
                                        name,
                                        slug: generateSlug(name),
                                    }));
                                }}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="slug">{t('super_admin.slug')}</Label>
                            <Input
                                id="slug"
                                value={form.slug}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, slug: e.target.value }))
                                }
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">{t('super_admin.description')}</Label>
                            <Textarea
                                id="description"
                                value={form.description}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, description: e.target.value }))
                                }
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="price_monthly">{t('super_admin.monthly_price')}</Label>
                                <Input
                                    id="price_monthly"
                                    type="number"
                                    min={0}
                                    value={form.price_monthly}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, price_monthly: Number(e.target.value) }))
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price_yearly">{t('super_admin.yearly_price')}</Label>
                                <Input
                                    id="price_yearly"
                                    type="number"
                                    min={0}
                                    value={form.price_yearly}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, price_yearly: Number(e.target.value) }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="max_students">{t('super_admin.max_students')}</Label>
                                <Input
                                    id="max_students"
                                    type="number"
                                    min={-1}
                                    value={form.max_students}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, max_students: Number(e.target.value) }))
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="max_staff">{t('super_admin.max_staff')}</Label>
                                <Input
                                    id="max_staff"
                                    type="number"
                                    min={-1}
                                    value={form.max_staff}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, max_staff: Number(e.target.value) }))
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="max_batches">{t('super_admin.max_batches')}</Label>
                                <Input
                                    id="max_batches"
                                    type="number"
                                    min={-1}
                                    value={form.max_batches}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, max_batches: Number(e.target.value) }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>{t('super_admin.features')}</Label>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_FEATURES.map((feature) => (
                                    <Button
                                        key={feature}
                                        type="button"
                                        variant={form.features.includes(feature) ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => toggleFeature(feature)}
                                    >
                                        {feature}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="is_active"
                                    checked={form.is_active}
                                    onCheckedChange={(checked) =>
                                        setForm((prev) => ({ ...prev, is_active: checked }))
                                    }
                                />
                                <Label htmlFor="is_active">{t('super_admin.active')}</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="is_default"
                                    checked={form.is_default}
                                    onCheckedChange={(checked) =>
                                        setForm((prev) => ({ ...prev, is_default: checked }))
                                    }
                                />
                                <Label htmlFor="is_default">{t('super_admin.default_plan')}</Label>
                            </div>
                        </div>
                    </form>
                    <SheetFooter>
                        <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>
                            {t('actions.cancel')}
                        </Button>
                        <Button type="submit" disabled={processing} onClick={handleSubmit}>
                            {processing ? t('actions.processing') : editingPlan ? t('actions.update') : t('actions.create')}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, item: deleteDialog.item })}
                title={t('super_admin.delete_plan')}
                description={`${t('super_admin.delete_plan_confirm')} "${deleteDialog.item?.name ?? ''}"`}
                confirmText={t('actions.delete')}
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}
