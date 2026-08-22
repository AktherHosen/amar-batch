import { Head, router, usePage } from '@inertiajs/react';
import { Eye, Trash2, Plus, EllipsisVertical, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import type { DataTableProps } from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import Heading from '@/components/heading';
import { RefreshButton } from '@/components/refresh-button';
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
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/contexts/locale-context';
import InputError from '@/components/input-error';

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

type Student = { id: number; name: string };
type Batch = { id: number; name: string };

type PageProps = {
    receipts: {
        data: Receipt[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    students: Student[];
    batches: Batch[];
    filters: {
        search?: string;
    };
};

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

export default function FeeReceiptsIndex({ receipts: pagination, filters, students, batches }: PageProps) {
    const { t, formatCurrency } = useLocale();
    const [search, setSearch] = useState(filters.search || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Receipt | null }>({ open: false, item: null });
    const [sheetOpen, setSheetOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState({
        student_id: '',
        batch_id: '',
        month: String(currentMonth),
        year: String(currentYear),
        amount_paid: '',
        amount_due: '',
        notes: '',
    });

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

    const resetForm = () => {
        setForm({
            student_id: '',
            batch_id: '',
            month: String(currentMonth),
            year: String(currentYear),
            amount_paid: '',
            amount_due: '',
            notes: '',
        });
        setErrors({});
    };

    const handleCreateReceipt = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.post('/fees/receipts', {
            ...form,
            month: Number(form.month),
            year: Number(form.year),
            amount_paid: Number(form.amount_paid),
            amount_due: Number(form.amount_due),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Receipt generated successfully');
                setSheetOpen(false);
                resetForm();
                router.reload({ only: ['receipts'] });
            },
            onError: (err) => {
                setErrors(err as Record<string, string>);
            },
            onFinish: () => setProcessing(false),
        });
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
                            <a href={`/fees/receipts/${receipt.id}`} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="sm" className="size-8 p-0">
                                    <Eye className="size-4" />
                                </Button>
                            </a>
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8 p-0">
                                    <EllipsisVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { resetForm(); setSheetOpen(true); }}>
                                    <Plus className="mr-2 size-4" />
                                    New Receipt
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

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>New Receipt</SheetTitle>
                        <SheetDescription>
                            Generate a fee receipt for a student.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleCreateReceipt} className="space-y-4 px-4 pb-4">
                        <div className="space-y-2">
                            <Label>Student *</Label>
                            <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select student" />
                                </SelectTrigger>
                                <SelectContent>
                                    {students.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.student_id} />
                        </div>

                        <div className="space-y-2">
                            <Label>Batch *</Label>
                            <Select value={form.batch_id} onValueChange={(v) => setForm({ ...form, batch_id: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select batch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {batches.map((b) => (
                                        <SelectItem key={b.id} value={String(b.id)}>
                                            {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.batch_id} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Month *</Label>
                                <Select value={form.month} onValueChange={(v) => setForm({ ...form, month: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MONTHS.map((m, i) => (
                                            <SelectItem key={i + 1} value={String(i + 1)}>
                                                {m}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.month} />
                            </div>

                            <div className="space-y-2">
                                <Label>Year *</Label>
                                <Input
                                    type="number"
                                    value={form.year}
                                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                                    min="2020"
                                    max="2100"
                                />
                                <InputError message={errors.year} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Amount Paid *</Label>
                                <Input
                                    type="number"
                                    value={form.amount_paid}
                                    onChange={(e) => setForm({ ...form, amount_paid: e.target.value })}
                                    placeholder="0"
                                    min="0"
                                />
                                <InputError message={errors.amount_paid} />
                            </div>

                            <div className="space-y-2">
                                <Label>Amount Due *</Label>
                                <Input
                                    type="number"
                                    value={form.amount_due}
                                    onChange={(e) => setForm({ ...form, amount_due: e.target.value })}
                                    placeholder="0"
                                    min="0"
                                />
                                <InputError message={errors.amount_due} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                placeholder="Optional notes"
                                rows={3}
                            />
                            <InputError message={errors.notes} />
                        </div>

                        <div className="flex justify-end gap-2 border-t pt-4">
                            <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create Receipt'}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

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
