import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, RefreshCw, Search, X, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useLocale } from '@/contexts/locale-context';
import { usePage } from '@inertiajs/react';

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
    const { t } = useLocale();
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Receipt | null }>({ open: false, item: null });

    const handleSearch = () => {
        router.get('/fees/receipts', { search }, { preserveState: true });
    };

    const handleDelete = (receipt: Receipt) => {
        setDeleteDialog({ open: true, item: receipt });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(`/fees/receipts/${deleteDialog.item.id}`, {
                onSuccess: () => toast.success('Receipt deleted successfully'),
            });
            setDeleteDialog({ open: false, item: null });
        }
    };

    return (
        <>
            <Head title="Fee Receipts" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Fee Receipts"
                        description="Manage and generate fee receipts"
                    />
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search receipts..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pr-9 pl-9"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            router.get('/fees/receipts', {}, { preserveState: true });
                                        }}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={handleSearch}>
                                    <Search className="size-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Search</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={refreshing}
                                    onClick={() => {
                                        setRefreshing(true);
                                        router.reload({
                                            only: ['receipts'],
                                            onFinish: () => setRefreshing(false),
                                        });
                                    }}
                                >
                                    <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="whitespace-nowrap">Receipt #</TableHead>
                                    <TableHead className="whitespace-nowrap">Student</TableHead>
                                    <TableHead className="whitespace-nowrap">Batch</TableHead>
                                    <TableHead className="whitespace-nowrap">Period</TableHead>
                                    <TableHead className="whitespace-nowrap">Amount Paid</TableHead>
                                    <TableHead className="whitespace-nowrap">Amount Due</TableHead>
                                    <TableHead className="whitespace-nowrap">Date</TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pagination.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center">
                                            No receipts found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pagination.data.map((receipt) => (
                                        <TableRow key={receipt.id}>
                                            <TableCell className="whitespace-nowrap font-medium">
                                                {receipt.receipt_number}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {receipt.student.name}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {receipt.batch.name}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {MONTHS[receipt.month - 1]} {receipt.year}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                ${Number(receipt.amount_paid).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                ${Number(receipt.amount_due).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {new Date(receipt.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
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
                            itemName="receipts"
                            baseUrl="/fees/receipts"
                            preserveParams={{ search }}
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
