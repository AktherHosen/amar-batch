import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable  } from '@/components/data-table';
import type {DataTableProps} from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import Heading from '@/components/heading';
import { RefreshButton } from '@/components/refresh-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';

type Receipt = {
    id: number;
    receipt_number: string;
    student: { id: number; name: string };
    batch: { id: number; name: string };
    month: number;
    year: number;
    amount_paid: number;
    amount_due: number;
    created_at: string;
};

type PageProps = {
    receipts: {
        data: Receipt[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
};

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export default function FeeReceiptsIndex({ receipts: pagination, filters }: PageProps) {
    const { t, formatCurrency } = useLocale();
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Receipt | null }>({ open: false, item: null });

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get('/fees/receipts', { search: value }, { preserveState: true });
    };

    const clearAll = () => {
        setSearch('');
        router.get('/fees/receipts', {}, { preserveState: true });
    };

    const handleDelete = (receipt: Receipt) => {
        setDeleteDialog({ open: true, item: receipt });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(`/fees/receipts/${deleteDialog.item.id}`, {
                onSuccess: () => toast.success(t('toast.deleted_successfully')),
            });
            setDeleteDialog({ open: false, item: null });
        }
    };

    const columns = (() => {
        type Col = NonNullable<DataTableProps<Receipt, unknown>['columns']>[number];

        return [
            {
                id: 'receipt_number',
                accessorKey: 'receipt_number',
                header: 'Receipt #',
                enableSorting: true,
                meta: { sticky: true },
                cell: ({ row }: any) => (
                    <span className="font-medium">{row.original.receipt_number}</span>
                ),
            } as Col,
            {
                id: 'student',
                accessorKey: 'student.name',
                header: 'Student',
                enableSorting: true,
                cell: ({ row }: any) => <span>{row.original.student.name}</span>,
            } as Col,
            {
                id: 'batch',
                accessorKey: 'batch.name',
                header: 'Batch',
                enableSorting: false,
                cell: ({ row }: any) => <span>{row.original.batch.name}</span>,
            } as Col,
            {
                id: 'period',
                accessorKey: 'month',
                header: 'Period',
                enableSorting: false,
                cell: ({ row }: any) => (
                    <span>
                        {MONTHS[row.original.month - 1]} {row.original.year}
                    </span>
                ),
            } as Col,
            {
                id: 'amount_paid',
                accessorKey: 'amount_paid',
                header: 'Amount Paid',
                enableSorting: true,
                cell: ({ row }: any) => (
                    <span>{formatCurrency(Number(row.original.amount_paid))}</span>
                ),
            } as Col,
            {
                id: 'amount_due',
                accessorKey: 'amount_due',
                header: 'Amount Due',
                enableSorting: true,
                cell: ({ row }: any) => (
                    <span>{formatCurrency(Number(row.original.amount_due))}</span>
                ),
            } as Col,
            {
                id: 'date',
                accessorKey: 'created_at',
                header: 'Date',
                enableSorting: true,
                cell: ({ row }: any) => (
                    <span>{new Date(row.original.created_at).toLocaleDateString()}</span>
                ),
            } as Col,
            {
                id: 'actions',
                header: '',
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }: any) => {
                    const receipt: Receipt = row.original;

                    return (
                        <div className="flex gap-1">
                            <Link href={`/fees/receipts/${receipt.id}`}>
                                <Button variant="ghost" size="sm" className="size-8 p-0">
                                    <Eye className="size-4" />
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="size-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleDelete(receipt)}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    );
                },
            } as Col,
        ];
    })();

    return (
        <>
            <Head title="Fee Receipts" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Fee Receipts"
                        description="Manage and generate fee receipts"
                    />
                    <div className="flex items-center gap-1">
                        <RefreshButton
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                router.reload({
                                    only: ['receipts'],
                                    onFinish: () => setRefreshing(false),
                                });
                            }}
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
                            itemName="receipts"
                            baseUrl="/fees/receipts"
                            preserveParams={{ search }}
                            emptyMessage="No receipts found"
                            getRowId={(row) => String(row.id)}
                            toolbar={
                                <FilterBar
                                    searchPlaceholder="Search receipts..."
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
                onOpenChange={(open) => setDeleteDialog({ open, item: deleteDialog.item })}
                title="Delete Receipt"
                description={`Are you sure you want to delete receipt ${deleteDialog.item?.receipt_number}? This action cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

FeeReceiptsIndex.layout = {
    breadcrumbs: [
        { title: 'Fees', href: '/fees' },
        { title: 'Receipts', href: '/fees/receipts' },
    ],
};