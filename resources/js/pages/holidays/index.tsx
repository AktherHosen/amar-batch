import { Head, router, useForm, usePage } from '@inertiajs/react';
import { EllipsisVertical, Eye, PenLine, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable  } from '@/components/data-table';
import type {DataTableProps} from '@/components/data-table';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { isOwner } from '@/lib/role';
import holidays from '@/routes/holidays';

type Holiday = {
    id: number;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string;
    type: string;
    created_at: string;
};

type PageProps = {
    holidays: {
        data: Holiday[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        type?: string;
    };
};

export default function HolidaysIndex({
    holidays: pagination,
    filters,
}: PageProps) {
    const { t, formatDate } = useLocale();
    const { auth } = usePage().props;
    const isAdmin = isOwner(auth.user);
    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: Holiday | null;
    }>({ open: false, item: null });
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Holiday | null>(null);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        type: 'holiday',
    });

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            '/holidays',
            { search: value, type: typeFilter },
            { preserveState: true },
        );
    };

    const handleDelete = (holiday: Holiday) => {
        setDeleteDialog({ open: true, item: holiday });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(`/holidays/${deleteDialog.item.id}`, {
                onSuccess: () => toast.success(t('toast.deleted_successfully')),
            });
            setDeleteDialog({ open: false, item: null });
        }
    };

    const handleCreate = () => {
        setEditingItem(null);
        reset();
        setData({
            title: '',
            description: '',
            start_date: '',
            end_date: '',
            type: 'holiday',
        });
        setSheetOpen(true);
    };

    const handleEdit = (holiday: Holiday) => {
        setEditingItem(holiday);
        setData({
            title: holiday.title,
            description: holiday.description || '',
            start_date: holiday.start_date.split('T')[0],
            end_date: holiday.end_date.split('T')[0],
            type: holiday.type,
        });
        setSheetOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            put(`/holidays/${editingItem.id}`, {
                onSuccess: () => {
                    setSheetOpen(false);
                    setEditingItem(null);
                    reset();
                    toast.success(t('toast.updated_successfully'));
                },
            });
        } else {
            post('/holidays', {
                onSuccess: () => {
                    setSheetOpen(false);
                    reset();
                    toast.success(t('toast.created_successfully'));
                },
            });
        }
    };

    const getTypeBadge = (type: string) => {
        const variants: Record<
            string,
            'default' | 'secondary' | 'destructive'
        > = {
            holiday: 'default',
            exam: 'secondary',
            event: 'default',
        };

        return variants[type] || 'secondary';
    };

    const activeFilterCount = typeFilter ? 1 : 0;

    const columns = (() => {
        type Col = NonNullable<
            DataTableProps<Holiday, unknown>['columns']
        >[number];

        return [
            {
                id: 'title',
                accessorKey: 'title',
                header: 'Title',
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">{row.original.title}</span>
                ),
            } as Col,
            {
                id: 'start_date',
                accessorKey: 'start_date',
                header: 'Start Date',
                enableSorting: false,
                cell: ({ row }: any) =>
                    new Date(row.original.start_date).toLocaleDateString(),
            } as Col,
            {
                id: 'end_date',
                accessorKey: 'end_date',
                header: 'End Date',
                enableSorting: false,
                cell: ({ row }: any) =>
                    new Date(row.original.end_date).toLocaleDateString(),
            } as Col,
            {
                id: 'duration',
                accessorKey: 'end_date',
                header: 'Duration',
                enableSorting: false,
                cell: ({ row }: any) => {
                    const h: Holiday = row.original;

                    return (
                        <>
                            {Math.ceil(
                                (new Date(h.end_date).getTime() -
                                    new Date(h.start_date).getTime()) /
                                    (1000 * 60 * 60 * 24),
                            ) + 1}{' '}
                            day(s)
                        </>
                    );
                },
            } as Col,
            {
                id: 'type',
                accessorKey: 'type',
                header: 'Type',
                enableSorting: false,
                cell: ({ row }: any) => {
                    const h: Holiday = row.original;

                    return (
                        <Badge variant={getTypeBadge(h.type)}>{h.type}</Badge>
                    );
                },
            } as Col,
            {
                id: 'actions',
                header: '',
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }: any) => {
                    const holiday: Holiday = row.original;

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
                                        router.get(`/holidays/${holiday.id}`)
                                    }
                                >
                                    <Eye className="mr-2 size-4" />
                                    {t('actions.view')}
                                </DropdownMenuItem>
                                {isAdmin && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                handleEdit(holiday)
                                            }
                                        >
                                            <PenLine className="mr-2 size-4" />
                                            {t('actions.edit')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() =>
                                                handleDelete(holiday)
                                            }
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
            <Head title="Holiday Calendar" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Holiday Calendar"
                        description="Manage center holidays and events"
                    />
                    <div className="flex items-center gap-1">
                        <RefreshButton
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                router.reload({
                                    only: ['holidays'],
                                    onFinish: () => setRefreshing(false),
                                });
                            }}
                        />
                        <PageActions
                            isAdmin={isAdmin}
                            createLabel="New Holiday"
                            onCreate={handleCreate}
                            exportTitle="Holidays"
                            exportFilename="holidays"
                            exportHeaders={[
                                'Title',
                                'Description',
                                'Start Date',
                                'End Date',
                                'Type',
                            ]}
                            exportRows={pagination.data.map((h) => [
                                h.title,
                                h.description || '',
                                h.start_date ? formatDate(h.start_date) : '',
                                h.end_date ? formatDate(h.end_date) : '',
                                h.type,
                            ])}
                            importUrl="/holidays/import"
                            importFields={[
                                'title',
                                'description',
                                'start_date',
                                'end_date',
                                'type',
                            ]}
                            onImportSuccess={() =>
                                router.reload({ only: ['holidays'] })
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
                            itemName="holidays"
                            baseUrl={holidays.index().url}
                            preserveParams={{ search, type: typeFilter }}
                            emptyMessage="No holidays found"
                            getRowId={(row) => String(row.id)}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder="Search holidays..."
                                    searchValue={search}
                                    onSearchChange={handleSearch}
                                    activeFilterCount={activeFilterCount}
                                    filters={[
                                        {
                                            id: 'type',
                                            placeholder: 'All Types',
                                            value: typeFilter,
                                            options: [
                                                {
                                                    label: 'Holiday',
                                                    value: 'holiday',
                                                },
                                                {
                                                    label: 'Exam',
                                                    value: 'exam',
                                                },
                                                {
                                                    label: 'Event',
                                                    value: 'event',
                                                },
                                            ],
                                            onValueChange: (value) => {
                                                setTypeFilter(value);
                                                router.get(
                                                    '/holidays',
                                                    { search, type: value },
                                                    { preserveState: true },
                                                );
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
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    setDeleteDialog({ open, item: deleteDialog.item })
                }
                title="Delete Holiday"
                description={`Are you sure you want to delete "${deleteDialog.item?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
                onConfirm={confirmDelete}
            />

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {editingItem ? t('actions.edit') + ' Holiday' : t('actions.create') + ' Holiday'}
                        </SheetTitle>
                        <SheetDescription>
                            {editingItem
                                ? t('actions.update') + ' holiday details'
                                : 'Add a new holiday or event'}
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-4">
                        <div className="space-y-2">
                            <Label htmlFor="sheet-title">Title *</Label>
                            <Input
                                id="sheet-title"
                                value={data.title}
                                onChange={(e) =>
                                    setData('title', e.target.value)
                                }
                                placeholder="Enter holiday title"
                            />
                            <InputError message={errors.title} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sheet-description">
                                Description
                            </Label>
                            <Textarea
                                id="sheet-description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Enter holiday description"
                                rows={3}
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="sheet-start_date">
                                    Start Date *
                                </Label>
                                <Input
                                    id="sheet-start_date"
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) =>
                                        setData('start_date', e.target.value)
                                    }
                                />
                                <InputError message={errors.start_date} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sheet-end_date">
                                    End Date *
                                </Label>
                                <Input
                                    id="sheet-end_date"
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) =>
                                        setData('end_date', e.target.value)
                                    }
                                />
                                <InputError message={errors.end_date} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sheet-type">Type *</Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(value) =>
                                        setData('type', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="holiday">
                                            Holiday
                                        </SelectItem>
                                        <SelectItem value="exam">
                                            Exam Period
                                        </SelectItem>
                                        <SelectItem value="event">
                                            Event
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.type} />
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
                            {editingItem ? t('actions.update') : t('actions.create')}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}

HolidaysIndex.layout = {
    breadcrumbs: [{ title: 'Holiday Calendar', href: '/holidays' }],
};
