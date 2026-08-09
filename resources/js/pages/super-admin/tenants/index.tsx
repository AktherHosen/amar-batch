import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link, router, usePage } from '@inertiajs/react';
import { Eye, RefreshCw, Search, X } from 'lucide-react';
import { useState } from 'react';

type Tenant = {
    id: number;
    name: string;
    slug: string;
    email: string | null;
    is_active: boolean;
    created_at: string;
    users_count: number;
    students_count: number;
    batches_count: number;
};

type PageProps = {
    tenants: {
        data: Tenant[];
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

export default function TenantsIndex({ tenants: pagination, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [refreshing, setRefreshing] = useState(false);

    const handleSearch = () => {
        router.get('/super-admin/tenants', { search, status }, { preserveState: true });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value === 'all' ? '' : value);
        router.get('/super-admin/tenants', { search, status: value === 'all' ? '' : value }, { preserveState: true });
    };

    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Coaching Centers" description="Manage all coaching centers" />
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search coaching centers..."
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
                                            router.get('/super-admin/tenants', { status }, { preserveState: true });
                                        }}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-3 sm:gap-4">
                                <Select value={status || 'all'} onValueChange={handleStatusChange}>
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                        router.reload({ only: ['tenants'], onFinish: () => setRefreshing(false) });
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
                                        Name
                                    </TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Users</TableHead>
                                    <TableHead>Students</TableHead>
                                    <TableHead>Batches</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pagination.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">
                                            No coaching centers found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pagination.data.map((tenant) => (
                                        <TableRow key={tenant.id}>
                                            <TableCell className="sticky left-0 z-10 bg-background font-medium">
                                                {tenant.name}
                                            </TableCell>
                                            <TableCell>{tenant.email || '-'}</TableCell>
                                            <TableCell>{tenant.users_count}</TableCell>
                                            <TableCell>{tenant.students_count}</TableCell>
                                            <TableCell>{tenant.batches_count}</TableCell>
                                            <TableCell>
                                                <Badge variant={tenant.is_active ? 'default' : 'destructive'}>
                                                    {tenant.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="p-1 text-center">
                                                <Link href={`/super-admin/tenants/${tenant.id}`}>
                                                    <Button variant="ghost" size="sm" className="size-8 p-0">
                                                        <Eye className="size-4" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

TenantsIndex.layout = {
    breadcrumbs: [
        { title: 'Coaching Centers', href: '/super-admin/tenants' },
    ],
};
