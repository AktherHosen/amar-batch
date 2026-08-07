import Heading from '@/components/heading';
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
import students from '@/routes/students';
import type { Student } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { EllipsisVertical, Eye, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';

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
    const isAdmin = auth.user.role === 'admin';
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        item: any | null;
    }>({ open: false, item: null });

    const handleSearch = () => {
        router.get(
            students.index(),
            { search, status },
            { preserveState: true },
        );
    };

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
            toast.success('Student deleted successfully');
            setDeleteDialog({ open: false, item: null });
        }
    };

    return (
        <>
            <Head title={t('students.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('students.title')}
                        description={t('students.title')}
                    />
                    {isAdmin && (
                        <Link href={students.create()}>
                            <Button>
                                <Plus className="mr-2 size-4" />
                                {t('students.create')}
                            </Button>
                        </Link>
                    )}
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder={t('actions.search') + '...'}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleSearch()
                                    }
                                    className="pr-9 pl-9"
                                />
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
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-3 sm:gap-4">
                                <Select
                                    value={status || 'all'}
                                    onValueChange={handleStatusChange}
                                >
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('actions.search')} Status
                                        </SelectItem>
                                        <SelectItem value="active">
                                            {t('students.active')}
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            {t('students.inactive')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="secondary"
                                    onClick={handleSearch}
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
                                            only: ['students'],
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
                                    <TableHead className="sticky left-0 z-10 min-w-[150px] bg-background">
                                        {t('students.name')}
                                    </TableHead>
                                    <TableHead>{t('students.class')}</TableHead>
                                    <TableHead>{t('students.phone')}</TableHead>
                                    <TableHead>
                                        {t('students.guardian_name')}
                                    </TableHead>
                                    <TableHead>
                                        {t('students.joined_at')}
                                    </TableHead>
                                    <TableHead>
                                        {t('students.status')}
                                    </TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pagination.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center"
                                        >
                                            {t('students.title')}{' '}
                                            {t('actions.search')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pagination.data.map((student) => (
                                        <TableRow key={student.id}>
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
                title="Delete Student"
                description={`Are you sure you want to delete ${deleteDialog.item?.name}?`}
                confirmText="Delete"
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
