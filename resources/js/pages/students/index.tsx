import { isOwner } from '@/lib/role';
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
import {
    Download,
    EllipsisVertical,
    Eye,
    PenLine,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { DataTable, type DataTableProps } from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import { RefreshButton } from '@/components/refresh-button';
import Heading from '@/components/heading';
import { useLocale } from '@/contexts/locale-context';
import students from '@/routes/students';
import type { Student } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';

function formatDate(dateStr: string | null): string {
    if (!dateStr) {
        return '-';
    }

    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
}

type PageProps = {
    auth: { user: { role: string } };
    students: {
        data: Student[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
};

export default function StudentsIndex({
    students: pagination,
    filters,
}: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const isAdmin = isOwner(auth.user);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: Student | null;
    }>({ open: false, item: null });

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            students.index(),
            { search: value, status },
            { preserveState: true },
        );
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get(
            students.index(),
            { search, status: value },
            { preserveState: true },
        );
    };

    const clearAll = () => {
        setSearch('');
        setStatus('');
        router.get(students.index(), {}, { preserveState: true });
    };

    const handleDelete = (student: Student) => {
        setDeleteDialog({ open: true, item: student });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(students.destroy(deleteDialog.item.id));
            toast.success(t('toast.deleted_successfully'));
            setDeleteDialog({ open: false, item: null });
        }
    };

    const handleRowStatusChange = (student: Student, value: string) => {
        if (value === student.status) return;
        router.patch(
            students.status(student.id),
            { status: value },
            {
                preserveState: true,
                onSuccess: () => {
                    toast.success(t('toast.updated_successfully'));
                    router.reload({ only: ['students'] });
                },
            },
        );
    };

    const activeFilterCount = status ? 1 : 0;

    const columns = (() => {
        type Col = NonNullable<
            DataTableProps<Student, unknown>['columns']
        >[number];
        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: t('students.name'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => {
                    const s: Student = row.original;
                    const className = s.coaching_class
                        ? `${s.coaching_class.name}${s.section ? ` - ${s.section}` : ''}`
                        : s.section || '';
                    return (
                        <div className="min-w-0">
                            <Link
                                href={students.show(s.id)}
                                className="font-medium hover:underline"
                            >
                                {s.name}
                            </Link>
                            {className && (
                                <div className="text-xs text-muted-foreground">
                                    {className}
                                </div>
                            )}
                        </div>
                    );
                },
            } as Col,
            {
                id: 'phone',
                accessorKey: 'phone',
                header: t('students.phone'),
                enableSorting: false,
                cell: ({ row }: any) => row.original.phone || '-',
            } as Col,
            {
                id: 'joined_at',
                accessorKey: 'joined_at',
                header: t('students.joined_at'),
                enableSorting: true,
                cell: ({ row }: any) => formatDate(row.original.joined_at),
            } as Col,
            {
                id: 'status',
                accessorKey: 'status',
                header: t('students.status'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const s: Student = row.original;
                    if (!isAdmin) {
                        return (
                            <Badge
                                variant={
                                    s.status === 'active' ? 'default' : 'danger'
                                }
                            >
                                {s.status}
                            </Badge>
                        );
                    }
                    return (
                        <Select
                            value={s.status}
                            onValueChange={(value) =>
                                handleRowStatusChange(s, value)
                            }
                        >
                            <SelectTrigger className="h-8 w-auto min-w-[7rem]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">
                                    <span className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-green-600" />
                                        {t('students.active')}
                                    </span>
                                </SelectItem>
                                <SelectItem value="inactive">
                                    <span className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-red-600" />
                                        {t('students.inactive')}
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    );
                },
            } as Col,
            {
                id: 'actions',
                header: '',
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }: any) => {
                    const s: Student = row.original;
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
                                    <Link href={students.show(s.id)}>
                                        <Eye className="mr-2 size-4" />
                                        {t('actions.view')}
                                    </Link>
                                </DropdownMenuItem>
                                {isAdmin && (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link href={students.edit(s.id)}>
                                                <Pencil className="mr-2 size-4" />
                                                {t('actions.edit')}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleDelete(s)}
                                            className="text-destructive"
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
            <Head title={t('students.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title={t('students.title')}
                        description={t('students.desc')}
                    />
                    <div className="flex items-center gap-1">
                        <RefreshButton
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                router.reload({
                                    only: ['students'],
                                    onFinish: () => setRefreshing(false),
                                });
                            }}
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
                                {isAdmin && (
                                    <DropdownMenuItem asChild>
                                        <Link href={students.create()}>
                                            <Plus className="mr-2 size-4" />
                                            {t('students.create')}
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={() =>
                                        (window.location.href =
                                            '/students/export')
                                    }
                                >
                                    <Download className="mr-2 size-4" />
                                    {t('actions.export_csv')}
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
                            itemName={t('students.title').toLowerCase()}
                            baseUrl={students.index().url}
                            preserveParams={{ search, status }}
                            emptyMessage="No students found"
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
                                            placeholder: t(
                                                'students.all_status',
                                            ),
                                            value: status,
                                            options: [
                                                {
                                                    label: t('students.active'),
                                                    value: 'active',
                                                },
                                                {
                                                    label: t(
                                                        'students.inactive',
                                                    ),
                                                    value: 'inactive',
                                                },
                                            ],
                                            onValueChange: handleStatusChange,
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
                title={t('students.delete_title')}
                description={t('students.delete_confirm')}
                confirmText={t('actions.delete')}
                cancelText={t('actions.cancel')}
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

StudentsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Students',
            href: students.index(),
        },
    ],
};
