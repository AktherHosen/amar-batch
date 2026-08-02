import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import fees from '@/routes/fees';

type FeeStatus = {
    id: number;
    student: { id: number; name: string; email: string };
    batch: { id: number; name: string };
    amount_paid: number;
    amount_due: number;
    due_date: string | null;
    status: 'paid' | 'partial' | 'unpaid';
    payment_date: string | null;
    notes: string | null;
};

type PageProps = {
    auth: { user: { role: string } };
    feeStatuses: {
        data: FeeStatus[];
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

export default function FeesIndex({ feeStatuses: pagination, filters }: PageProps) {
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleSearch = () => {
        router.get(fees.index(), { search, status }, { preserveState: true });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value === 'all' ? '' : value);
        router.get(fees.index(), { search, status: value === 'all' ? '' : value }, { preserveState: true });
    };

    const handleDelete = (fee: FeeStatus) => {
        if (confirm('Are you sure you want to delete this fee record?')) {
            router.delete(fees.destroy(fee.id));
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            paid: 'default',
            partial: 'secondary',
            unpaid: 'destructive',
        };
        return variants[status] || 'secondary';
    };

    return (
        <>
            <Head title="Fee Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Fee Management" description="Track student fee payments" />
                    {isAdmin && (
                        <Link href={fees.create()}>
                            <Button>
                                <Plus className="mr-2 size-4" />
                                Add Fee Record
                            </Button>
                        </Link>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by student name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={status || 'all'} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="partial">Partial</SelectItem>
                                    <SelectItem value="unpaid">Unpaid</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="secondary" onClick={handleSearch}>
                                Search
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Batch</TableHead>
                                    <TableHead>Amount Paid</TableHead>
                                    <TableHead>Amount Due</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pagination.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={isAdmin ? 7 : 6} className="text-center">
                                            No fee records found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pagination.data.map((fee) => (
                                        <TableRow key={fee.id}>
                                            <TableCell className="font-medium">{fee.student.name}</TableCell>
                                            <TableCell>{fee.batch.name}</TableCell>
                                            <TableCell>${fee.amount_paid.toFixed(2)}</TableCell>
                                            <TableCell>${fee.amount_due.toFixed(2)}</TableCell>
                                            <TableCell>{fee.due_date ? new Date(fee.due_date).toLocaleDateString() : '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadge(fee.status)}>{fee.status}</Badge>
                                            </TableCell>
                                            {isAdmin && (
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={fees.edit(fee.id)}>
                                                            <Button variant="ghost" size="sm">
                                                                <Pencil className="size-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(fee)}>
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {pagination.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {pagination.data.length} of {pagination.total} records
                                </p>
                                <div className="flex gap-2">
                                    {pagination.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(
                                                    fees.index(),
                                                    { page: pagination.current_page - 1, search, status },
                                                    { preserveState: true }
                                                )
                                            }
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {pagination.current_page < pagination.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(
                                                    fees.index(),
                                                    { page: pagination.current_page + 1, search, status },
                                                    { preserveState: true }
                                                )
                                            }
                                        >
                                            Next
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

FeesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Fees',
            href: fees.index(),
        },
    ],
};
