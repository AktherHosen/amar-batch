import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, EllipsisVertical, Eye, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { isOwner } from '@/lib/role';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale } from '@/contexts/locale-context';
import { DataTable, type DataTableProps } from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import { RefreshButton } from '@/components/refresh-button';
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

export default function HolidaysIndex({ holidays: pagination, filters }: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage().props;
    const isAdmin = isOwner(auth.user);
    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Holiday | null }>({ open: false, item: null });

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get('/holidays', { search: value, type: typeFilter }, { preserveState: true });
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

    const getTypeBadge = (type: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            holiday: 'default',
            exam: 'secondary',
            event: 'default',
        };
        return variants[type] || 'secondary';
    };

    const activeFilterCount = typeFilter ? 1 : 0;

    const columns = (() => {
        type Col = NonNullable<DataTableProps<Holiday, unknown>['columns']>[number];
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
                cell: ({ row }: any) => new Date(row.original.start_date).toLocaleDateString(),
            } as Col,
            {
                id: 'end_date',
                accessorKey: 'end_date',
                header: 'End Date',
                enableSorting: false,
                cell: ({ row }: any) => new Date(row.original.end_date).toLocaleDateString(),
            } as Col,
            {
                id: 'duration',
                accessorKey: 'end_date',
                header: 'Duration',
                enableSorting: false,
                cell: ({ row }: any) => {
                    const h: Holiday = row.original;
                    return (
                        <>{Math.ceil((new Date(h.end_date).getTime() - new Date(h.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} day(s)</>
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
                        <Badge variant={getTypeBadge(h.type)}>
                            {h.type}
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
                    const holiday: Holiday = row.original;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="size-8 p-0">
                                    <EllipsisVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.get(`/holidays/${holiday.id}`)}>
                                    <Eye className="mr-2 size-4" />
                                    View
                                </DropdownMenuItem>
                                {isAdmin && (
                                    <>
                                        <DropdownMenuItem onClick={() => router.get(`/holidays/${holiday.id}/edit`)}>
                                            <Pencil className="mr-2 size-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(holiday)}>
                                            <Trash2 className="mr-2 size-4" />
                                            Delete
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
                                router.reload({ only: ['holidays'], onFinish: () => setRefreshing(false) });
                            }}
                        />
                        {isAdmin && (
                            <Link href="/holidays/create">
                                <Button>
                                    <Plus className="mr-2 size-4" />
                                    Add Holiday
                                </Button>
                            </Link>
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
                                                { label: 'Holiday', value: 'holiday' },
                                                { label: 'Exam', value: 'exam' },
                                                { label: 'Event', value: 'event' },
                                            ],
                                            onValueChange: (value) => {
                                                setTypeFilter(value);
                                                router.get('/holidays', { search, type: value }, { preserveState: true });
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
                onOpenChange={(open) => setDeleteDialog({ open, item: deleteDialog.item })}
                title="Delete Holiday"
                description={`Are you sure you want to delete "${deleteDialog.item?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

HolidaysIndex.layout = {
    breadcrumbs: [
        { title: 'Holiday Calendar', href: '/holidays' },
    ],
};