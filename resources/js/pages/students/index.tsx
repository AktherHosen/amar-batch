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
import { Download, EllipsisVertical, Eye, PenLine, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useLocale } from '@/contexts/locale-context';
import students from '@/routes/students';
import type { Student } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
    let timer: ReturnType<typeof setTimeout>;
    const debounced = (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
    debounced.cancel = () => clearTimeout(timer);
    return debounced;
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) {
        return '-';
    }

    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
}

type PageProps = {
    auth: { user: { role: string } };
    students: {
        data: Student[];
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

export default function StudentsIndex({
    students: pagination,
    filters,
}: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const isAdmin = isOwner(auth.user);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [refreshing, setRefreshing] = useState(false);

    const debouncedSearch = useCallback(
        debounce((value: string) => {
            router.get(
                students.index(),
                { search: value, status },
                { preserveState: true },
            );
        }, 300),
        [status],
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: any | null;
    }>({ open: false, item: null });

    const handleStatusChange = (value: string) => {
        setStatus(value === 'all' ? '' : value);
        router.get(
            students.index(),
            { search, status: value === 'all' ? '' : value },
            { preserveState: true },
        );
    };

    const handleDelete = (student: Student) => {
        setDeleteDialog({ open: true, item: student });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(students.destroy(deleteDialog.item.id));
            toast.success(t('toast.deleted_successfully'));
            setDeleteDialog({ open: false, item: null });
        }
    };

    return (
        <>
            <Head title={t('students.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                        <h2 className="text-xl font-semibold tracking-tight">
                            {t('students.title')}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {t('students.desc')}
                        </p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 p-0">
                                <EllipsisVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.location.href = '/students/export'}>
                                <Download className="mr-2 size-4" />
                                {t('actions.export_csv')}
                            </DropdownMenuItem>
                            {isAdmin && (
                                <DropdownMenuItem asChild>
                                    <Link href={students.create()}>
                                        <Plus className="mr-2 size-4" />
                                        {t('students.create')}
                                    </Link>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder={t('actions.search') + '...'}
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        debouncedSearch(e.target.value);
                                    }}
                                    className="pr-16 pl-9"
                                />
                                <div className="absolute top-1/2 right-1 -translate-y-1/2 flex items-center">
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearch('');
                                                router.get(
                                                    students.index(),
                                                    { status },
                                                    { preserveState: true },
                                                );
                                            }}
                                            className="p-1 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 p-0"
                                        disabled={refreshing}
                                        onClick={() => {
                                            setRefreshing(true);
                                            router.reload({
                                                only: ['students'],
                                                onFinish: () => setRefreshing(false),
                                            });
                                        }}
                                    >
                                        <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
                                    </Button>
                                </div>
                            </div>
                            <Select
                                value={status || 'all'}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder={t('students.all_status')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {t('students.all_status')}
                                    </SelectItem>
                                    <SelectItem value="active">
                                        {t('students.active')}
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        {t('students.inactive')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="sticky left-0 z-10 min-w-[150px] bg-background whitespace-nowrap">
                                        {t('students.name')}
                                    </TableHead>
                                    <TableHead className="whitespace-nowrap">{t('students.class')}</TableHead>
                                    <TableHead className="whitespace-nowrap">{t('students.phone')}</TableHead>
                                    <TableHead className="whitespace-nowrap">
                                        {t('students.guardian_name')}
                                    </TableHead>
                                    <TableHead className="whitespace-nowrap">
                                        {t('students.joined_at')}
                                    </TableHead>
                                    <TableHead className="whitespace-nowrap">
                                        {t('students.status')}
                                    </TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            {pagination.data.length === 0 ? (
                                <TableBody>
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center"
                                        >
                                            No students found
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            ) : (
                                <motion.tbody
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        hidden: {},
                                        visible: { transition: { staggerChildren: 0.03 } },
                                    }}
                                >
                                {pagination.data.map((student) => (
                                    <motion.tr
                                        key={student.id}
                                        variants={{
                                            hidden: { opacity: 0, x: -8 },
                                            visible: { opacity: 1, x: 0 },
                                        }}
                                    >
                                            <TableCell className="sticky left-0 z-10 bg-background font-medium">
                                                {student.name}
                                            </TableCell>
                                            <TableCell>
                                                {student.coaching_class
                                                    ? `${student.coaching_class.name}${student.section ? ` - ${student.section}` : ''}`
                                                    : student.section || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {student.phone || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {student.guardian_name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(student.joined_at)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        student.status ===
                                                        'active'
                                                            ? 'default'
                                                            : 'warning'
                                                    }
                                                >
                                                    {student.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="p-1 text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="size-8 p-0">
                                                            <EllipsisVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={students.show(student.id)}>
                                                                <Eye className="mr-2 size-4" />
                                                                {t('actions.view')}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {isAdmin && (
                                                            <>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={students.edit(student.id)}>
                                                                        <Pencil className="mr-2 size-4" />
                                                                        {t('actions.edit')}
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleDelete(student)} className="text-destructive">
                                                                    <Trash2 className="mr-2 size-4" />
                                                                    {t('actions.delete')}
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </motion.tr>
                                ))}
                                </motion.tbody>
                            )}
                        </Table>

                        <Pagination
                            currentPage={pagination.current_page}
                            lastPage={pagination.last_page}
                            total={pagination.total}
                            perPage={pagination.per_page}
                            itemName={t('students.title').toLowerCase() + 's'}
                            baseUrl={students.index()}
                            preserveParams={{ search, status }}
                        />
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    setDeleteDialog({ open, item: deleteDialog.item })
                }
                title={t('students.delete_title')}
                description={t('students.delete_confirm')}
                confirmText={t('actions.delete')}
                cancelText={t('actions.cancel')}
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

StudentsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Students',
            href: students.index(),
        },
    ],
};
