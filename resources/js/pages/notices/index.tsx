import { Head, router, useForm, usePage } from '@inertiajs/react';
import { EllipsisVertical, Eye, PenLine, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import CellTitle from '@/components/cell-title';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/contexts/locale-context';
import { isOwner } from '@/lib/role';
import notices from '@/routes/notices';

type Notice = {
    id: number;
    title: string;
    content: string;
    batch: { id: number; name: string } | null;
    batch_id: number | null;
    creator: { id: number; name: string };
    is_active: boolean;
    target_audience: string;
    priority: string;
    published_at: string | null;
    created_at: string;
};

type Batch = {
    id: number;
    name: string;
};

type PageProps = {
    notices: {
        data: Notice[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    batches: Batch[];
    filters: {
        search?: string;
        batch_id?: string;
    };
};

export default function NoticesIndex({
    notices: pagination,
    batches,
    filters,
}: PageProps) {
    const { t, formatDate } = useLocale();
    const { auth } = usePage().props;
    const isAdmin = isOwner(auth.user);
    const [search, setSearch] = useState(filters.search || '');
    const [batchId, setBatchId] = useState(filters.batch_id || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: Notice | null;
    }>({ open: false, item: null });
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Notice | null>(null);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        content: '',
        batch_id: '',
        target_audience: 'all',
        priority: 'medium',
        is_active: true,
    });

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            '/notices',
            { search: value, batch_id: batchId },
            { preserveState: true },
        );
    };

    const handleDelete = (notice: Notice) => {
        setDeleteDialog({ open: true, item: notice });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(`/notices/${deleteDialog.item.id}`, {
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
            content: '',
            batch_id: '',
            target_audience: 'all',
            priority: 'medium',
            is_active: true,
        });
        setSheetOpen(true);
    };

    const handleEdit = (notice: Notice) => {
        setEditingItem(notice);
        setData({
            title: notice.title,
            content: notice.content,
            batch_id: notice.batch_id ? String(notice.batch_id) : '',
            target_audience: notice.target_audience || 'all',
            priority: notice.priority || 'medium',
            is_active: notice.is_active,
        });
        setSheetOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            put(`/notices/${editingItem.id}`, {
                onSuccess: () => {
                    setSheetOpen(false);
                    setEditingItem(null);
                    reset();
                    toast.success(t('toast.updated_successfully'));
                },
            });
        } else {
            post('/notices', {
                onSuccess: () => {
                    setSheetOpen(false);
                    reset();
                    toast.success(t('toast.created_successfully'));
                },
            });
        }
    };

    const activeFilterCount = batchId ? 1 : 0;

    const columns = (() => {
        type Col = NonNullable<
            DataTableProps<Notice, unknown>['columns']
        >[number];

        return [
            {
                id: 'title',
                accessorKey: 'title',
                header: 'Title',
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <CellTitle
                        title={row.original.title}
                        href={`/notices/${row.original.id}`}
                    />
                ),
            } as Col,
            {
                id: 'batch',
                accessorKey: 'batch.name',
                header: 'Batch',
                enableSorting: false,
                cell: ({ row }: any) => {
                    const notice: Notice = row.original;

                    return notice.batch ? (
                        <Badge variant="secondary">{notice.batch.name}</Badge>
                    ) : (
                        <Badge variant="outline">Center-wide</Badge>
                    );
                },
            } as Col,
            {
                id: 'status',
                accessorKey: 'is_active',
                header: 'Status',
                enableSorting: false,
                cell: ({ row }: any) => {
                    const notice: Notice = row.original;

                    return (
                        <Badge
                            variant={notice.is_active ? 'success' : 'secondary'}
                        >
                            {notice.is_active ? 'Active' : 'Draft'}
                        </Badge>
                    );
                },
            } as Col,
            {
                id: 'creator',
                accessorKey: 'creator.name',
                header: 'Posted by',
                enableSorting: false,
                cell: ({ row }: any) => row.original.creator.name,
            } as Col,
            {
                id: 'date',
                accessorKey: 'created_at',
                header: 'Date',
                enableSorting: false,
                cell: ({ row }: any) =>
                    new Date(row.original.created_at).toLocaleDateString(),
            } as Col,
            {
                id: 'actions',
                header: '',
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }: any) => {
                    const notice: Notice = row.original;

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
                                        router.get(`/notices/${notice.id}`)
                                    }
                                >
                                    <Eye className="mr-2 size-4" />
                                    {t('actions.view')}
                                </DropdownMenuItem>
                                {isAdmin && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                handleEdit(notice)
                                            }
                                        >
                                            <PenLine className="mr-2 size-4" />
                                            {t('actions.edit')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => handleDelete(notice)}
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
            <Head title="Notice Board" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Notice Board"
                        description="Post and manage announcements"
                    />
                    <div className="flex items-center gap-1">
                        <RefreshButton
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                router.reload({
                                    only: ['notices'],
                                    onFinish: () => setRefreshing(false),
                                });
                            }}
                        />
                        <PageActions
                            isAdmin={isAdmin}
                            createLabel="New Notice"
                            onCreate={handleCreate}
                            exportTitle="Notices"
                            exportFilename="notices"
                            exportHeaders={[
                                'Title',
                                'Content',
                                'Batch',
                                'Status',
                                'Published',
                            ]}
                            exportRows={pagination.data.map((n) => [
                                n.title,
                                n.content,
                                n.batch?.name || 'Center-wide',
                                n.is_active ? 'Active' : 'Draft',
                                n.published_at
                                    ? formatDate(n.published_at)
                                    : '',
                            ])}
                            importUrl="/notices/import"
                            importFields={[
                                'title',
                                'content',
                                'batch_id',
                                'target_audience',
                                'priority',
                            ]}
                            onImportSuccess={() =>
                                router.reload({ only: ['notices'] })
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
                            itemName="notices"
                            baseUrl={notices.index().url}
                            preserveParams={{ search, batch_id: batchId }}
                            emptyMessage="No notices found"
                            getRowId={(row) => String(row.id)}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder="Search notices..."
                                    searchValue={search}
                                    onSearchChange={handleSearch}
                                    activeFilterCount={activeFilterCount}
                                    filters={[
                                        {
                                            id: 'batch_id',
                                            placeholder: 'All Batches',
                                            value: batchId,
                                            options: [
                                                {
                                                    label: 'Center-wide',
                                                    value: 'center',
                                                },
                                                ...batches.map((batch) => ({
                                                    label: batch.name,
                                                    value: String(batch.id),
                                                })),
                                            ],
                                            onValueChange: (value) => {
                                                setBatchId(value);
                                                router.get(
                                                    '/notices',
                                                    { search, batch_id: value },
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
                title="Delete Notice"
                description={`Are you sure you want to delete "${deleteDialog.item?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
                onConfirm={confirmDelete}
            />

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {editingItem ? t('actions.edit') + ' Notice' : t('actions.create') + ' Notice'}
                        </SheetTitle>
                        <SheetDescription>
                            {editingItem
                                ? t('actions.update') + ' notice details'
                                : 'Post a new announcement'}
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
                                placeholder="Enter notice title"
                            />
                            <InputError message={errors.title} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sheet-content">Content *</Label>
                            <Textarea
                                id="sheet-content"
                                value={data.content}
                                onChange={(e) =>
                                    setData('content', e.target.value)
                                }
                                placeholder="Enter notice content"
                                rows={6}
                            />
                            <InputError message={errors.content} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sheet-batch_id">
                                Batch (optional)
                            </Label>
                            <Select
                                value={data.batch_id}
                                onValueChange={(value) =>
                                    setData('batch_id', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Center-wide (all batches)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="center">
                                        Center-wide (all batches)
                                    </SelectItem>
                                    {batches.map((batch) => (
                                        <SelectItem
                                            key={batch.id}
                                            value={String(batch.id)}
                                        >
                                            {batch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.batch_id} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="sheet-target_audience">
                                    Target Audience
                                </Label>
                                <Select
                                    value={data.target_audience}
                                    onValueChange={(value) =>
                                        setData('target_audience', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="teachers">
                                            Teachers
                                        </SelectItem>
                                        <SelectItem value="students">
                                            Students
                                        </SelectItem>
                                        <SelectItem value="parents">
                                            Parents
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.target_audience} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sheet-priority">Priority</Label>
                                <Select
                                    value={data.priority}
                                    onValueChange={(value) =>
                                        setData('priority', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">
                                            Medium
                                        </SelectItem>
                                        <SelectItem value="high">
                                            High
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.priority} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={data.is_active}
                                    onCheckedChange={(checked) =>
                                        setData('is_active', checked)
                                    }
                                />
                                <span className="text-sm text-muted-foreground">
                                    {data.is_active
                                        ? 'Active (published)'
                                        : 'Draft'}
                                </span>
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

NoticesIndex.layout = {
    breadcrumbs: [{ title: 'Notice Board', href: '/notices' }],
};
