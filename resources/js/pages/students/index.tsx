import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Eye, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';

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
        if (confirm(`Are you sure you want to delete ${student.name}?`)) {
            router.delete(students.destroy(student.id));
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
                            </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('students.name')}</TableHead>
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
                                    <TableHead className="text-right">
                                        {t('actions.view')}
                                    </TableHead>
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
                                            <TableCell className="font-medium">
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
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={students.show(
                                                            student.id,
                                                        )}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Eye className="size-4" />
                                                        </Button>
                                                    </Link>
                                                    {isAdmin && (
                                                        <>
                                                            <Link
                                                                href={students.edit(
                                                                    student.id,
                                                                )}
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                >
                                                                    <Pencil className="size-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        student,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {pagination.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {pagination.data.length} of{' '}
                                    {pagination.total} {t('students.title')}
                                </p>
                                <div className="flex gap-2">
                                    {pagination.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(
                                                    students.index(),
                                                    {
                                                        page:
                                                            pagination.current_page -
                                                            1,
                                                        search,
                                                        status,
                                                    },
                                                    { preserveState: true },
                                                )
                                            }
                                        >
                                            {t('actions.back')}
                                        </Button>
                                    )}
                                    {pagination.current_page <
                                        pagination.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(
                                                    students.index(),
                                                    {
                                                        page:
                                                            pagination.current_page +
                                                            1,
                                                        search,
                                                        status,
                                                    },
                                                    { preserveState: true },
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

StudentsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Students',
            href: students.index(),
        },
    ],
};
