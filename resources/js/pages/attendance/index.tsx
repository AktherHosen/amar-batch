import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { EllipsisVertical, PenLine, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import attendance from '@/routes/attendance';
import { useLocale } from '@/contexts/locale-context';

type AttendanceRecord = {
    id: number;
    student: { id: number; name: string };
    batch: { id: number; name: string };
    date: string;
    status: 'present' | 'absent' | 'late';
    notes: string | null;
};

type Batch = {
    id: number;
    name: string;
};

type PageProps = {
    auth: { user: { role: string } };
    attendances: {
        data: AttendanceRecord[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    batches: Batch[];
    filters: {
        batch_id?: string;
        date?: string;
    };
};

export default function AttendanceIndex({
    attendances: pagination,
    batches,
    filters,
}: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';
    const isTeacher = auth.user.role === 'teacher';
    const [batchId, setBatchId] = useState(filters.batch_id || '');
    const [date, setDate] = useState(filters.date || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: any | null;
    }>({ open: false, item: null });

    const handleFilter = () => {
        router.get(
            attendance.index(),
            { batch_id: batchId, date },
            { preserveState: true },
        );
    };

    const handleDelete = (record: AttendanceRecord) => {
        setDeleteDialog({ open: true, item: record });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(attendance.destroy(deleteDialog.item.id));
            toast.success('Attendance record deleted successfully');
            setDeleteDialog({ open: false, item: null });
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            'default' | 'secondary' | 'destructive'
        > = {
            present: 'default',
            late: 'secondary',
            absent: 'destructive',
        };

        return variants[status] || 'secondary';
    };

    return (
        <>
            <Head title={t('attendance.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('attendance.title')}
                        description={t('attendance.title')}
                    />
                    {(isAdmin || isTeacher) && (
                        <Link href={attendance.create()}>
                            <Button>
                                <Plus className="mr-2 size-4" />
                                {t('attendance.mark')}
                            </Button>
                        </Link>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                            <Select
                                value={batchId || 'all'}
                                onValueChange={(v) =>
                                    setBatchId(v === 'all' ? '' : v)
                                }
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="All Batches" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {t('attendance.batch')}
                                    </SelectItem>
                                    {batches.map((batch) => (
                                        <SelectItem
                                            key={batch.id}
                                            value={batch.id.toString()}
                                        >
                                            {batch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex gap-3 sm:gap-4">
                                <div className="relative flex-1">
                                    <Input
                                        type="date"
                                        value={date}
                                        onChange={(e) =>
                                            setDate(e.target.value)
                                        }
                                        className="w-full pr-9"
                                    />
                                    {date && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDate('');
                                                router.get(
                                                    attendance.index(),
                                                    { batch_id: batchId },
                                                    { preserveState: true },
                                                );
                                            }}
                                            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    )}
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={handleFilter}
                                >
                                    <Search className="size-4 sm:mr-2" />
                                    <span className="hidden sm:inline">
                                        {t('actions.search')}
                                    </span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={refreshing}
                                    onClick={() => {
                                        setRefreshing(true);
                                        router.reload({
                                            only: ['records'],
                                            onFinish: () => setRefreshing(false),
                                        });
                                    }}
                                >
                                    <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="sticky left-0 z-10 min-w-[150px] bg-background">
                                        {t('attendance.student')}
                                    </TableHead>
                                    <TableHead>
                                        {t('attendance.batch')}
                                    </TableHead>
                                    <TableHead>
                                        {t('attendance.date')}
                                    </TableHead>
                                    <TableHead>
                                        {t('attendance.status')}
                                    </TableHead>
                                    <TableHead>
                                        {t('attendance.notes')}
                                    </TableHead>
                                    {(isAdmin || isTeacher) && (
                                        <TableHead className="w-[50px]"></TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pagination.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={
                                                isAdmin || isTeacher ? 6 : 5
                                            }
                                            className="text-center"
                                        >
                                            {t('attendance.title')}{' '}
                                            {t('actions.search')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pagination.data.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell className="sticky left-0 z-10 bg-background font-medium">
                                                {record.student.name}
                                            </TableCell>
                                            <TableCell>
                                                {record.batch.name}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(
                                                    record.date,
                                                ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={getStatusBadge(
                                                        record.status,
                                                    )}
                                                >
                                                    {record.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {record.notes || '-'}
                                            </TableCell>
                                            {(isAdmin || isTeacher) && (
                                                <TableCell className="p-1 text-center">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="size-8 p-0">
                                                                <EllipsisVertical className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => router.get(attendance.edit(record.id))}>
                                                                <PenLine className="mr-2 size-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(record)}>
                                                                <Trash2 className="mr-2 size-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            )}
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
                            itemName={t('attendance.title').toLowerCase() + 's'}
                            baseUrl={attendance.index()}
                            preserveParams={{ batch_id: batchId, date }}
                        />
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    setDeleteDialog({ open, item: deleteDialog.item })
                }
                title="Delete Attendance Record"
                description="Are you sure you want to delete this attendance record?"
                confirmText="Delete"
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

AttendanceIndex.layout = {
    breadcrumbs: [
        {
            title: 'Attendance',
            href: attendance.index(),
        },
    ],
};
