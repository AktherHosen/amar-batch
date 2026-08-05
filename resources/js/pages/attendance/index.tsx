import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Trash2 } from 'lucide-react';
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

export default function AttendanceIndex({ attendances: pagination, batches, filters }: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';
    const isTeacher = auth.user.role === 'teacher';
    const [batchId, setBatchId] = useState(filters.batch_id || '');
    const [date, setDate] = useState(filters.date || '');

    const handleFilter = () => {
        router.get(attendance.index(), { batch_id: batchId, date }, { preserveState: true });
    };

    const handleDelete = (record: AttendanceRecord) => {
        if (confirm('Are you sure you want to delete this attendance record?')) {
            router.delete(attendance.destroy(record.id));
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
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
                    <Heading title={t('attendance.title')} description={t('attendance.title')} />
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
                        <div className="flex items-center gap-4">
                            <Select value={batchId || 'all'} onValueChange={(v) => setBatchId(v === 'all' ? '' : v)}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="All Batches" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('attendance.batch')}</SelectItem>
                                    {batches.map((batch) => (
                                        <SelectItem key={batch.id} value={batch.id.toString()}>
                                            {batch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-[200px]"
                            />
                            <Button variant="secondary" onClick={handleFilter}>
                                <Search className="mr-2 size-4" />
                                {t('actions.search')}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('attendance.student')}</TableHead>
                                    <TableHead>{t('attendance.batch')}</TableHead>
                                    <TableHead>{t('attendance.date')}</TableHead>
                                    <TableHead>{t('attendance.status')}</TableHead>
                                    <TableHead>{t('attendance.notes')}</TableHead>
                                    {(isAdmin || isTeacher) && <TableHead className="text-right">{t('actions.view')}</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pagination.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={isAdmin || isTeacher ? 6 : 5} className="text-center">
                                            {t('attendance.title')} {t('actions.search')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pagination.data.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell className="font-medium">{record.student.name}</TableCell>
                                            <TableCell>{record.batch.name}</TableCell>
                                            <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadge(record.status)}>{record.status}</Badge>
                                            </TableCell>
                                            <TableCell>{record.notes || '-'}</TableCell>
                                            {(isAdmin || isTeacher) && (
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(record)}>
                                                        <Trash2 className="size-4" />
                                                    </Button>
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
                                    Showing {pagination.data.length} of {pagination.total} {t('attendance.title')}
                                </p>
                                <div className="flex gap-2">
                                    {pagination.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(
                                                    attendance.index(),
                                                    { page: pagination.current_page - 1, batch_id: batchId, date },
                                                    { preserveState: true }
                                                )
                                            }
                                        >
                                            {t('actions.back')}
                                        </Button>
                                    )}
                                    {pagination.current_page < pagination.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(
                                                    attendance.index(),
                                                    { page: pagination.current_page + 1, batch_id: batchId, date },
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

AttendanceIndex.layout = {
    breadcrumbs: [
        {
            title: 'Attendance',
            href: attendance.index(),
        },
    ],
};
