import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Pencil } from 'lucide-react';
import fees from '@/routes/fees';

type Student = {
    id: number;
    name: string;
    coaching_class: { id: number; name: string } | null;
};

type Batch = {
    id: number;
    name: string;
};

type FeeRecord = {
    id: number;
    student_id: number;
    batch_id: number;
    month: number;
    year: number;
    amount_paid: number;
    notes: string | null;
};

type FeeGridItem = {
    student: Student;
    batch: Batch;
    months: Record<number, FeeRecord>;
};

type PageProps = {
    auth: { user: { role: string } };
    feeGrid: FeeGridItem[];
    students: Student[];
    batches: Batch[];
    months: number[];
    monthNames: Record<number, string>;
    year: number;
    filters: {
        search?: string;
        year?: string;
    };
};

export default function FeesIndex({ feeGrid, months, monthNames, year, filters }: PageProps) {
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';
    const [search, setSearch] = useState(filters.search || '');
    const [selectedYear, setSelectedYear] = useState(year);

    const handleSearch = () => {
        router.get(fees.index.url({ search, year: selectedYear }), {}, { preserveState: true });
    };

    const handleYearChange = (newYear: number) => {
        setSelectedYear(newYear);
        router.get(fees.index.url({ search, year: newYear }), {}, { preserveState: true });
    };

    const handleDelete = (feeId: number) => {
        if (confirm('Are you sure you want to delete this fee record?')) {
            router.delete(fees.destroy.url(feeId));
        }
    };

    const formatAmount = (amount: number) => {
        return amount > 0 ? amount.toFixed(0) : '-';
    };

    const yearOptions = [];
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 2; y <= currentYear + 1; y++) {
        yearOptions.push(y);
    }

    return (
        <>
            <Head title="Fee Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Fee Management" description="Track monthly fee payments" />
                    {isAdmin && (
                        <Link href={fees.create.url()}>
                            <Button>
                                <Plus className="mr-2 size-4" />
                                Add Fee Record
                            </Button>
                        </Link>
                    )}
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by student name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-9"
                                />
                            </div>
                            <select
                                value={selectedYear}
                                onChange={(e) => handleYearChange(Number(e.target.value))}
                                className="flex h-10 w-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                {yearOptions.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <Button variant="secondary" onClick={handleSearch}>
                                Search
                            </Button>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="sticky left-0 bg-background z-10 min-w-[150px]">Student</TableHead>
                                        <TableHead className="min-w-[100px]">Class</TableHead>
                                        <TableHead className="min-w-[100px]">Batch</TableHead>
                                        {months.map((m) => (
                                            <TableHead key={m} className="text-center min-w-[80px]">
                                                {monthNames[m].slice(0, 3)}
                                            </TableHead>
                                        ))}
                                        {isAdmin && <TableHead className="text-right min-w-[80px]">Actions</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {feeGrid.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={isAdmin ? months.length + 4 : months.length + 3} className="text-center">
                                                No fee records found. Click "Add Fee Record" to get started.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        feeGrid.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium sticky left-0 bg-background z-10">
                                                    {item.student.name}
                                                </TableCell>
                                                <TableCell>
                                                    {item.student.coaching_class?.name || '-'}
                                                </TableCell>
                                                <TableCell>{item.batch.name}</TableCell>
                                                {months.map((m) => {
                                                    const fee = item.months[m];
                                                    return (
                                                        <TableCell key={m} className="text-center">
                                                            {fee ? (
                                                                <span className={fee.amount_paid > 0 ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                                                                    {formatAmount(fee.amount_paid)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground">-</span>
                                                            )}
                                                        </TableCell>
                                                    );
                                                })}
                                                {isAdmin && (
                                                    <TableCell className="text-right">
                                                        {item.months[months[0]] && (
                                                            <div className="flex justify-end gap-1">
                                                                <Link href={fees.edit.url(item.months[months[0]].id)}>
                                                                    <Button variant="ghost" size="sm">
                                                                        <Pencil className="size-3" />
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
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
            href: fees.index.url(),
        },
    ],
};
