import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Building2,
    Users,
    GraduationCap,
    Layers,
} from 'lucide-react';

type Stats = {
    total_tenants: number;
    active_tenants: number;
    total_users: number;
    total_students: number;
    total_batches: number;
    active_batches: number;
};

type TenantStat = {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    users_count: number;
    students_count: number;
    batches_count: number;
};

type PageProps = {
    stats: Stats;
    tenantStats: TenantStat[];
};

export default function SuperAdminDashboard({ stats, tenantStats }: PageProps) {
    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    title="Platform Dashboard"
                    description="Overview of all coaching centers"
                />

                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">
                                Coaching Centers
                            </CardTitle>
                            <Building2 className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{stats.total_tenants}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.active_tenants} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">
                                Total Users
                            </CardTitle>
                            <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{stats.total_users}</div>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">
                                Total Students
                            </CardTitle>
                            <GraduationCap className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{stats.total_students}</div>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">
                                Active Batches
                            </CardTitle>
                            <Layers className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{stats.active_batches}</div>
                            <p className="text-xs text-muted-foreground">
                                of {stats.total_batches} total
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Coaching Centers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {tenantStats.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Users</TableHead>
                                        <TableHead>Students</TableHead>
                                        <TableHead>Batches</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tenantStats.map((tenant) => (
                                        <TableRow key={tenant.id}>
                                            <TableCell className="font-medium">
                                                {tenant.name}
                                            </TableCell>
                                            <TableCell>{tenant.users_count}</TableCell>
                                            <TableCell>{tenant.students_count}</TableCell>
                                            <TableCell>{tenant.batches_count}</TableCell>
                                            <TableCell>
                                                <Badge variant={tenant.is_active ? 'default' : 'destructive'}>
                                                    {tenant.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No coaching centers yet.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

SuperAdminDashboard.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/super-admin/dashboard' },
    ],
};
