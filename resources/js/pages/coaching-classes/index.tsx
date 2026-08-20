import { Head, Link, router, usePage } from '@inertiajs/react';
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable  } from '@/components/data-table';
import type {DataTableProps} from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import Heading from '@/components/heading';
import PageActions from '@/components/page-actions';
import { RefreshButton } from '@/components/refresh-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale } from '@/contexts/locale-context';
import { isOwner } from '@/lib/role';
import coachingClasses from '@/routes/coaching-classes';

type CoachingClass = {
    id: number;
    name: string;
    default_fee: number;
    students_count: number;
};

type PageProps = {
    auth: { user: { role: string } };
    classes: {
        data: CoachingClass[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
};

export default function CoachingClassesIndex({
    classes: pagination,
    filters,
}: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const isAdmin = isOwner(auth.user);
    const [search, setSearch] = useState(filters.search || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: any | null;
    }>({ open: false, item: null });

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            coachingClasses.index(),
            { search: value },
            { preserveState: true },
        );
    };

    const clearAll = () => {
        setSearch('');
        router.get(coachingClasses.index(), {}, { preserveState: true });
    };

    const handleDelete = (cls: CoachingClass) => {
        setDeleteDialog({ open: true, item: cls });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(coachingClasses.destroy(deleteDialog.item.id));
            toast.success(t('toast.deleted_successfully'));
            setDeleteDialog({ open: false, item: null });
        }
    };

    const columns = (() => {
        type Col = NonNullable<
            DataTableProps<CoachingClass, unknown>['columns']
        >[number];

        return [
            {
                id: 'name',
                accessorKey: 'name',
                header: t('classes.name'),
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">{row.original.name}</span>
                ),
            } as Col,
            {
                id: 'default_fee',
                accessorKey: 'default_fee',
                header: t('classes.default_fee'),
                enableSorting: true,
                cell: ({ row }: any) => (
                    <span>{Number(row.original.default_fee).toFixed(0)}</span>
                ),
            } as Col,
            {
                id: 'students_count',
                accessorKey: 'students_count',
                header: t('batches.enrolled'),
                enableSorting: false,
                cell: ({ row }: any) => (
                    <span>{row.original.students_count}</span>
                ),
            } as Col,
            ...(isAdmin
                ? [
                      {
                          id: 'actions',
                          header: '',
                          enableSorting: false,
                          enableHiding: false,
                          cell: ({ row }: any) => {
                              const cls: CoachingClass = row.original;

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
                                              <Link
                                                  href={coachingClasses.edit(
                                                      cls.id,
                                                  )}
                                              >
                                                  <Pencil className="mr-2 size-4" />
                                                  {t('actions.edit')}
                                              </Link>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                              onClick={() => handleDelete(cls)}
                                              className="text-destructive"
                                          >
                                              <Trash2 className="mr-2 size-4" />
                                              {t('actions.delete')}
                                          </DropdownMenuItem>
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                              );
                          },
                      } as Col,
                  ]
                : []),
        ];
    })();

    return (
        <>
            <Head title={t('classes.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title={t('classes.title')}
                        description={t('classes.desc')}
                    />
                    <div className="flex items-center gap-1">
                        <RefreshButton
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                router.reload({
                                    only: ['classes'],
                                    onFinish: () => setRefreshing(false),
                                });
                            }}
                        />
                        <PageActions
                            isAdmin={isAdmin}
                            createLabel={t('classes.create')}
                            onCreate={() =>
                                router.get(coachingClasses.create())
                            }
                            exportTitle={t('classes.title')}
                            exportFilename="coaching_classes"
                            exportHeaders={[
                                t('classes.name'),
                                t('classes.default_fee'),
                                t('batches.enrolled'),
                            ]}
                            exportRows={pagination.data.map((c) => [
                                c.name,
                                c.default_fee,
                                c.students_count,
                            ])}
                            importUrl="/coaching-classes/import"
                            importFields={['name', 'default_fee']}
                            onImportSuccess={() =>
                                router.reload({ only: ['classes'] })
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
                            itemName={t('classes.title').toLowerCase()}
                            baseUrl={coachingClasses.index().url}
                            preserveParams={{ search }}
                            emptyMessage="No coaching classes found"
                            getRowId={(row) => String(row.id)}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder={
                                        t('actions.search') + '...'
                                    }
                                    searchValue={search}
                                    onSearchChange={handleSearch}
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
                    setDeleteDialog({ open, item: deleteDialog.item })
                }
                title={t('classes.delete_title')}
                description={t('classes.delete_confirm').replace(
                    '{name}',
                    deleteDialog.item?.name || '',
                )}
                confirmText={t('actions.delete')}
                cancelText={t('actions.cancel')}
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

CoachingClassesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Coaching Classes',
            href: coachingClasses.index(),
        },
    ],
};
