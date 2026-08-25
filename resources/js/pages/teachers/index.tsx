import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CheckCircle,
    EllipsisVertical,
    Eye,
    PenLine,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import type { DataTableProps } from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import Heading from '@/components/heading';
import PageActions from '@/components/page-actions';
import { RefreshButton } from '@/components/refresh-button';
import TeacherForm from '@/components/teacher-form';
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
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useLocale } from '@/contexts/locale-context';
import { useHasFeature } from '@/lib/features';
import { isOwner } from '@/lib/role';
import teachers from '@/routes/teachers';

type TeacherRow = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_approved: boolean;
    assigned_batches_count: number;
    avatar: string | null;
    branch: { id: number; name: string } | null;
};

type PageProps = {
    auth: { user: { role: string } };
    teachers: {
        data: TeacherRow[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
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

export default function TeachersIndex({
    teachers: pagination,
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
    const [refreshing, setRefreshing] = useState(false);

    const roleName = (slug: string) => {
        if (slug === 'inactive') {
return t('teachers.inactive');
}

        return roles.find((r) => r.slug === slug)?.name ?? slug;
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            teachers.index(),
            { search: value, status },
            { preserveState: true },
        );
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get(
            teachers.index(),
            { search, status: value },
            { preserveState: true },
        );
    };

    const clearAll = () => {
        setSearch('');
        setStatus('');
        router.get(teachers.index(), {}, { preserveState: true });
    };

    const activeFilterCount = status ? 1 : 0;

    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: any | null;
    }>({ open: false, item: null });
    const [approveDialog, setApproveDialog] = useState<{
        open: boolean;
        item: any | null;
    }>({ open: false, item: null });
    const [rejectDialog, setRejectDialog] = useState<{
        open: boolean;
        item: any | null;
    }>({ open: false, item: null });

    const [sheetOpen, setSheetOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<TeacherRow | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleCreate = () => {
        setEditingTeacher(null);
        setSheetOpen(true);
    };

    const handleEdit = (teacher: TeacherRow) => {
        setEditingTeacher(teacher);
        setSheetOpen(true);
    };

    const handleSheetSubmit = (formData: FormData) => {
        setProcessing(true);

        if (editingTeacher) {
            formData.append('_method', 'PUT');
            router.post(teachers.update(editingTeacher.id), formData, {
                preserveScroll: true,
                onSuccess: () => {
                    setSheetOpen(false);
                    setEditingTeacher(null);
                    toast.success(t('toast.updated_successfully'));
                    router.reload({ only: ['teachers'] });
                },
                onFinish: () => setProcessing(false),
            });
        } else {
            router.post(teachers.store(), formData, {
                preserveScroll: true,
                onSuccess: () => {
                    setSheetOpen(false);
                    toast.success(t('toast.created_successfully'));
                    router.reload({ only: ['teachers'] });
                },
                onFinish: () => setProcessing(false),
            });
        }
    };

    const handleDelete = (teacher: {
        id: number;
        name: string;
        role: string;
    }) => {
        setDeleteDialog({ open: true, item: teacher });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(teachers.destroy(deleteDialog.item.id));
            toast.success(
                deleteDialog.item.role === 'inactive'
                    ? t('toast.updated_successfully')
                    : t('toast.deactivated_successfully'),
            );
            setDeleteDialog({ open: false, item: null });
        }
    };

    const handleApprove = (teacher: { id: number; name: string }) => {
        setApproveDialog({ open: true, item: teacher });
    };

    const confirmApprove = () => {
        if (approveDialog.item) {
            router.post(
                teachers.approve(approveDialog.item.id).url,
                {},
                {
                    onSuccess: () => {
                        toast.success(
                            `${approveDialog.item.name} ${t('toast.approved_successfully')}`,
                        );
                        router.reload({ only: ['teachers'] });
                    },
                },
            );
            setApproveDialog({ open: false, item: null });
        }
    };

    const handleReject = (teacher: { id: number; name: string }) => {
        setRejectDialog({ open: true, item: teacher });
    };

    const confirmReject = () => {
        if (rejectDialog.item) {
            router.post(
                teachers.reject(rejectDialog.item.id).url,
                {},
                {
                    onSuccess: () => {
                        toast.success(
                            `${rejectDialog.item.name} ${t('toast.revoked_successfully')}`,
                        );
                        router.reload({ only: ['teachers'] });
                    },
                },
            );
            setRejectDialog({ open: false, item: null });
        }
    };

    const handleRowStatusChange = (teacher: TeacherRow, value: string) => {
        const current =
            teacher.role === 'inactive'
                ? 'inactive'
                : teacher.is_approved
                  ? 'active'
                  : 'pending';

        if (value === current) {
return;
}

        router.patch(
            teachers.status(teacher.id).url,
            { status: value },
            {
                preserveState: true,
                onSuccess: () => {
                    toast.success(
                        value === 'inactive'
                            ? t('toast.deactivated_successfully')
                            : t('toast.updated_successfully'),
                    );
                    router.reload({ only: ['teachers'] });
                },
            },
        );
    };

    const columns = (() => {
        type Col = NonNullable<
            DataTableProps<TeacherRow, unknown>['columns']
        >[number];

        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: t('teachers.name'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">{row.original.name}</span>
                ),
            } as Col,
            {
                id: 'email',
                accessorKey: 'email',
                header: t('teachers.email'),
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
                header: t('teachers.role'),
                enableSorting: false,
                cell: ({ row }: any) => (
                    <span className="capitalize">
                        {roleName(row.original.role)}
                    </span>
                ),
            } as Col,
            {
                id: 'status',
                accessorKey: 'status',
                header: t('teachers.status'),
                enableSorting: false,
                cell: ({ row }: any) => {
                    const teacher: TeacherRow = row.original;
                    const statusValue =
                        teacher.role === 'inactive'
                            ? 'inactive'
                            : teacher.is_approved
                              ? 'active'
                              : 'pending';

                    return (
                        <Select
                            value={statusValue}
                            onValueChange={(value) =>
                                handleRowStatusChange(teacher, value)
                            }
                        >
                            <SelectTrigger className="h-8 w-auto min-w-[7rem]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">
                                    <span className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-green-600" />
                                        {t('teachers.active')}
                                    </span>
                                </SelectItem>
                                <SelectItem value="pending">
                                    <span className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-yellow-500" />
                                        {t('teachers.pending')}
                                    </span>
                                </SelectItem>
                                <SelectItem value="inactive">
                                    <span className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-red-600" />
                                        {t('teachers.inactive')}
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    );
                },
            } as Col,
            {
                id: 'assigned_batches_count',
                accessorKey: 'assigned_batches_count',
                header: t('batches.title'),
                enableSorting: false,
                cell: ({ row }: any) => row.original.assigned_batches_count,
            } as Col,
            {
                id: 'actions',
                header: '',
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }: any) => {
                    const teacher: TeacherRow = row.original;

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
                                    <Link href={teachers.show(teacher.id)}>
                                        <Eye className="mr-2 size-4" />
                                        {t('actions.view')}
                                    </Link>
                                </DropdownMenuItem>
                                {isAdmin && (
                                    <>
                                        {teacher.role === 'teacher' &&
                                            !teacher.is_approved && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleApprove(teacher)
                                                    }
                                                >
                                                    <CheckCircle className="mr-2 size-4 text-green-600" />
                                                    {t('teachers.approve')}
                                                </DropdownMenuItem>
                                            )}
                                        {teacher.role === 'teacher' &&
                                            teacher.is_approved && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleReject(teacher)
                                                    }
                                                >
                                                    <XCircle className="mr-2 size-4 text-yellow-600" />
                                                    {t(
                                                        'teachers.revoke_approval',
                                                    )}
                                                </DropdownMenuItem>
                                            )}
                                        <DropdownMenuItem
                                            onClick={() => handleEdit(teacher)}
                                        >
                                            <PenLine className="mr-2 size-4" />
                                            {t('actions.edit')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                handleDelete(teacher)
                                            }
                                            className={
                                                teacher.role === 'inactive'
                                                    ? ''
                                                    : 'text-destructive'
                                            }
                                        >
                                            <Trash2 className="mr-2 size-4" />
                                            {teacher.role === 'inactive'
                                                ? t('teachers.reactivate')
                                                : t('actions.delete')}
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
            <Head title={t('teachers.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title={t('teachers.title')}
                        description={t('teachers.desc')}
                    />
                    <div className="flex items-center gap-1">
                        <RefreshButton
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                router.reload({
                                    only: ['teachers'],
                                    onFinish: () => setRefreshing(false),
                                });
                            }}
                        />
                        <PageActions
                            isAdmin={isAdmin}
                            createLabel={t('teachers.create')}
                            onCreate={handleCreate}
                            exportTitle={t('teachers.title')}
                            exportFilename="teachers"
                            exportHeaders={[
                                t('teachers.name'),
                                t('teachers.email'),
                                t('teachers.role'),
                                t('batches.title'),
                            ]}
                            exportRows={pagination.data.map((t) => [
                                t.name,
                                t.email,
                                roleName(t.role),
                                t.assigned_batches_count,
                            ])}
                            importUrl="/teachers/import"
                            importFields={['name', 'email', 'phone', 'role']}
                            onImportSuccess={() =>
                                router.reload({ only: ['teachers'] })
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
                            itemName={t('teachers.title').toLowerCase()}
                            baseUrl={teachers.index().url}
                            preserveParams={{ search, status }}
                            emptyMessage={t('teachers.no_teachers')}
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
                                                'teachers.all_status',
                                            ),
                                            value: status,
                                            options: [
                                                {
                                                    label: t('teachers.active'),
                                                    value: 'active',
                                                },
                                                {
                                                    label: t(
                                                        'teachers.inactive',
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
                title={
                    deleteDialog.item?.role === 'inactive'
                        ? t('teachers.reactivate_title')
                        : t('teachers.deactivate_title')
                }
                description={(deleteDialog.item?.role === 'inactive'
                    ? t('teachers.reactivate_confirm')
                    : t('teachers.deactivate_confirm')
                ).replace('{name}', deleteDialog.item?.name ?? '')}
                confirmText={
                    deleteDialog.item?.role === 'inactive'
                        ? t('teachers.reactivate')
                        : t('teachers.deactivate')
                }
                cancelText={t('actions.cancel')}
                variant={
                    deleteDialog.item?.role === 'inactive'
                        ? 'default'
                        : 'destructive'
                }
                onConfirm={confirmDelete}
            />

            <ConfirmDialog
                open={approveDialog.open}
                onOpenChange={(open) =>
                    setApproveDialog({ open, item: approveDialog.item })
                }
                title={t('teachers.approve_title')}
                description={t('teachers.approve_confirm').replace(
                    '{name}',
                    approveDialog.item?.name ?? '',
                )}
                confirmText={t('teachers.approve')}
                cancelText={t('actions.cancel')}
                onConfirm={confirmApprove}
            />

            <ConfirmDialog
                open={rejectDialog.open}
                onOpenChange={(open) =>
                    setRejectDialog({ open, item: rejectDialog.item })
                }
                title={t('teachers.revoke_title')}
                description={t('teachers.revoke_confirm').replace(
                    '{name}',
                    rejectDialog.item?.name ?? '',
                )}
                confirmText={t('teachers.revoke_approval')}
                cancelText={t('actions.cancel')}
                variant="destructive"
                onConfirm={confirmReject}
            />

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {editingTeacher
                                ? `${t('actions.edit')} ${editingTeacher.name}`
                                : t('teachers.create')}
                        </SheetTitle>
                        <SheetDescription>
                            {editingTeacher
                                ? t('teachers.edit_desc')
                                : t('teachers.add_desc')}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="px-4 pb-4">
                        <TeacherForm
                            key={editingTeacher ? `edit-${editingTeacher.id}` : 'create'}
                            teacher={editingTeacher ? {
                                id: editingTeacher.id,
                                name: editingTeacher.name,
                                email: editingTeacher.email,
                                role: editingTeacher.role,
                                branch_id: editingTeacher.branch?.id ?? null,
                                avatar: editingTeacher.avatar ?? null,
                            } : undefined}
                            roles={roles}
                            branches={branches}
                            onSubmit={handleSheetSubmit}
                            onCancel={() => setSheetOpen(false)}
                            processing={processing}
                            errors={(usePage().props.errors as Record<string, string>) ?? {}}
                            hideActions
                        />
                    </div>
                    <SheetFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSheetOpen(false)}
                        >
                            {t('actions.cancel')}
                        </Button>
                        <Button type="submit" form="teacher-form" disabled={processing}>
                            {processing
                                ? editingTeacher
                                    ? t('actions.updating')
                                    : t('actions.creating')
                                : editingTeacher
                                  ? t('actions.update')
                                  : t('actions.create')}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}

TeachersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Teachers',
            href: teachers.index(),
        },
    ],
};
