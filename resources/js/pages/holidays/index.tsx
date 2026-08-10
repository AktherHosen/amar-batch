import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, RefreshCw, Search, X, Eye, Pencil, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { isOwner } from '@/lib/role';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useLocale } from '@/contexts/locale-context';

type Holiday = {
    id: number;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string;
    type: string;
    created_at: string;
};

type PageProps = {
    holidays: {
        data: Holiday[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        year?: string;
        month?: string;
    };
};

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export default function HolidaysIndex({ holidays: pagination, filters }: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage().props;
    const isAdmin = isOwner(auth.user);
    const [search, setSearch] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const handleSearch = () => {
        router.get('/holidays', { search }, { preserveState: true });
    };

    const handleDelete = (holiday: Holiday) => {
        if (confirm(`Are you sure you want to delete "${holiday.title}"?`)) {
            router.delete(`/holidays/${holiday.id}`, {
                onSuccess: () => toast.success('Holiday deleted successfully'),
            });
        }
    };

    const getTypeBadge = (type: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            holiday: 'default',
            exam: 'secondary',
            other: 'destructive',
        };
        return variants[type] || 'secondary';
    };

    return (
        <>
            <Head title="Holiday Calendar" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Holiday Calendar"
                        description="Manage center holidays and events"
                    />
                    {isAdmin && (
                        <Link href="/holidays/create">
                            <Button>
                                <Plus className="mr-2 size-4" />
                                Add Holiday
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
                                    placeholder="Search holidays..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pr-9 pl-9"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            router.get('/holidays', {}, { preserveState: true });
                                        }}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={handleSearch}>
                                    <Search className="size-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Search</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={refreshing}
                                    onClick={() => {
                                        setRefreshing(true);
                                        router.reload({
                                            only: ['holidays'],
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
                                    <TableHead className="whitespace-nowrap">Title</TableHead>
                                    <TableHead className="whitespace-nowrap">Start Date</TableHead>
                                    <TableHead className="whitespace-nowrap">End Date</TableHead>
                                    <TableHead className="whitespace-nowrap">Duration</TableHead>
                                    <TableHead className="whitespace-nowrap">Type</TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pagination.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">
                                            <div className="flex flex-col items-center gap-2 py-4">
                                                <Calendar className="size-8 text-muted-foreground" />
                                                <p>No holidays found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pagination.data.map((holiday) => (
                                        <TableRow key={holiday.id}>
                                            <TableCell className="whitespace-nowrap font-medium">
                                                {holiday.title}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {new Date(holiday.start_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {new Date(holiday.end_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {Math.ceil((new Date(holiday.end_date).getTime() - new Date(holiday.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} day(s)
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <Badge variant={getTypeBadge(holiday.type)}>
                                                    {holiday.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex gap-1">
                                                    <Link href={`/holidays/${holiday.id}`}>
                                                        <Button variant="ghost" size="sm" className="size-8 p-0">
                                                            <Eye className="size-4" />
                                                        </Button>
                                                    </Link>
                                                    {isAdmin && (
                                                        <>
                                                            <Link href={`/holidays/${holiday.id}/edit`}>
                                                                <Button variant="ghost" size="sm" className="size-8 p-0">
                                                                    <Pencil className="size-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="size-8 p-0 text-destructive hover:text-destructive"
                                                                onClick={() => handleDelete(holiday)}
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

                        <Pagination
                            currentPage={pagination.current_page}
                            lastPage={pagination.last_page}
                            total={pagination.total}
                            perPage={pagination.per_page}
                            itemName="holidays"
                            baseUrl="/holidays"
                            preserveParams={{ search }}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

HolidaysIndex.layout = {
    breadcrumbs: [
        { title: 'Holiday Calendar', href: '/holidays' },
    ],
};
