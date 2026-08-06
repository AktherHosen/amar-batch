import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, X } from 'lucide-react';
import Heading from '@/components/heading';
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
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import batches from '@/routes/batches';
import { useLocale } from '@/contexts/locale-context';

type PageProps = {
    auth: { user: { role: string } };
    batches: {
        data: Array<{
            id: number;
            name: string;
            subject: string | null;
            capacity: number;
            status: string;
            enrollments_count: number;
            start_date: string | null;
            end_date: string | null;
        }>;
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

export default function BatchesIndex({
    batches: pagination,
    filters,
}: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleSearch = () => {
        router.get(
            batches.index(),
            { search, status },
            { preserveState: true },
        );
    };

    const handleStatusChange = (value: string) => {
        setStatus(value === 'all' ? '' : value);
        router.get(
            batches.index(),
            { search, status: value === 'all' ? '' : value },
            { preserveState: true },
        );
    };

    const handleDelete = (batch: { id: number; name: string }) => {
        if (confirm(`Are you sure you want to delete ${batch.name}?`)) {
            router.delete(batches.destroy(batch.id));
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            'default' | 'secondary' | 'destructive'
        > = {
            active: 'default',
            inactive: 'secondary',
            archived: 'destructive',
        };

        return variants[status] || 'secondary';
    };

    return (
        <>
            <Head title={t('batches.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('batches.title')}
                        description={t('batches.title')}
                    />
                    {isAdmin && (
                        <Link href={batches.create()}>
                            <Button>
                                <Plus className="mr-2 size-4" />
                                {t('batches.create')}
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
                                                batches.index(),
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
                                        <SelectItem value="archived">
                                            Archived
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
                                    <TableHead>{t('batches.name')}</TableHead>
                                    <TableHead>
                                        {t('batches.subject')}
                                    </TableHead>
                                    <TableHead>
                                        {t('batches.capacity')}
                                    </TableHead>
                                    <TableHead>
                                        {t('batches.enrolled')}
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
                                            colSpan={6}
                                            className="text-center"
                                        >
                                            {t('batches.title')}{' '}
                                            {t('actions.search')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pagination.data.map((batch) => (
                                        <TableRow key={batch.id}>
                                            <TableCell className="font-medium">
                                                {batch.name}
                                            </TableCell>
                                            <TableCell>
                                                {batch.subject || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {batch.capacity}
                                            </TableCell>
                                            <TableCell>
                                                {batch.enrollments_count}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={getStatusBadge(
                                                        batch.status,
                                                    )}
                                                >
                                                    {batch.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={batches.show(
                                                            batch.id,
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
                                                                href={batches.edit(
                                                                    batch.id,
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
                                                                        batch,
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
                                    {pagination.total} {t('batches.title')}
                                </p>
                                <div className="flex gap-2">
                                    {pagination.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(
                                                    batches.index(),
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
                                                    batches.index(),
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

BatchesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Batches',
            href: batches.index(),
        },
    ],
};
