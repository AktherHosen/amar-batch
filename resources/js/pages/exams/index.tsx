import Heading from '@/components/heading';
import { isOwner } from '@/lib/role';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useLocale } from '@/contexts/locale-context';
import exams from '@/routes/exams';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { EllipsisVertical, Eye, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';

type Exam = {
    id: number;
    title: string;
    subject: string | null;
    batch: { id: number; name: string } | null;
    date: string | null;
    total_marks: number;
    passing_marks: number;
    created_at: string;
};

type Batch = {
    id: number;
    name: string;
};

type PageProps = {
    exams: {
        data: Exam[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    batches: Batch[];
    filters: { search?: string; batch_id?: string };
};

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

export default function ExamsIndex({ exams: pagination, batches, filters }: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage().props;
    const isAdmin = isOwner(auth.user);
    const [search, setSearch] = useState(filters.search || '');
    const [batchId, setBatchId] = useState(filters.batch_id || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Exam | null }>({ open: false, item: null });

    const handleSearch = () => {
        router.get(exams.index(), { search, batch_id: batchId }, { preserveState: true });
    };

    const handleRefresh = () => {
        setRefreshing(true);
        router.reload({
            onFinish: () => setRefreshing(false),
        });
    };

    const handleDelete = (exam: Exam) => {
        setDeleteDialog({ open: true, item: exam });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(exams.destroy(deleteDialog.item.id));
            toast.success('Exam deleted successfully');
            setDeleteDialog({ open: false, item: null });
        }
    };

    return (
        <>
            <Head title={t('exams.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading title={t('exams.title')} description={t('exams.desc')} />
                    {isAdmin && (
                        <Link href={exams.create()}>
                            <Button size="sm">
                                <Plus className="mr-2 size-4" />
                                {t('exams.create')}
                            </Button>
                        </Link>
                    )}
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder={t('actions.search') + '...'}
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                {search && (
                                    <button
                                        onClick={() => {
                                            setSearch('');
                                            router.get(exams.index(), { batch_id: batchId }, { preserveState: true });
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        <X className="size-4 text-muted-foreground hover:text-foreground" />
                                    </button>
                                )}
                            </div>
                            <Select
                                value={batchId}
                                onValueChange={(value) => {
                                    setBatchId(value === 'all' ? '' : value);
                                    router.get(exams.index(), { search, batch_id: value === 'all' ? '' : value }, { preserveState: true });
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder={t('exams.all_batches')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('exams.all_batches')}</SelectItem>
                                    {batches.map((batch) => (
                                        <SelectItem key={batch.id} value={String(batch.id)}>
                                            {batch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="sm" onClick={handleRefresh}>
                                <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="sticky left-0 z-10 min-w-[150px] bg-background">{t('exams.title')}</TableHead>
                                    <TableHead>{t('exams.subject')}</TableHead>
                                    <TableHead>{t('exams.batch')}</TableHead>
                                    <TableHead>{t('exams.date')}</TableHead>
                                    <TableHead>{t('exams.marks')}</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pagination.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            {t('exams.no_exams')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pagination.data.map((exam) => (
                                        <TableRow key={exam.id}>
                                            <TableCell className="sticky left-0 z-10 min-w-[150px] bg-background font-medium whitespace-nowrap">
                                                {exam.title}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{exam.subject || '-'}</TableCell>
                                            <TableCell className="whitespace-nowrap">{exam.batch?.name || '-'}</TableCell>
                                            <TableCell className="whitespace-nowrap">{formatDate(exam.date)}</TableCell>
                                            <TableCell className="whitespace-nowrap">{exam.total_marks} (pass: {exam.passing_marks})</TableCell>
                                            <TableCell className="p-1 text-center whitespace-nowrap">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="size-8 p-0">
                                                            <EllipsisVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => router.get(exams.show(exam.id))}>
                                                            <Eye className="mr-2 size-4" />
                                                            {t('actions.view')}
                                                        </DropdownMenuItem>
                                                        {isAdmin && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => router.get(exams.edit(exam.id))}>
                                                                    <Pencil className="mr-2 size-4" />
                                                                    {t('actions.edit')}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(exam)}>
                                                                    <Trash2 className="mr-2 size-4" />
                                                                    {t('actions.delete')}
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        <Pagination pagination={pagination} preserveParams={{ search, batch_id: batchId }} />
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
                title={t('confirm.are_you_sure')}
                description={t('exams.delete_confirm')}
                confirmText={t('confirm.delete')}
                onConfirm={confirmDelete}
            />
        </>
    );
}

ExamsIndex.layout = {
    breadcrumbs: [{ title: 'Exams', href: exams.index() }],
};
