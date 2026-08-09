import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { router } from '@inertiajs/react';
import { ArrowLeft, Building2, Users, GraduationCap, Layers } from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useState } from 'react';
import { toast } from 'sonner';

type Tenant = {
    id: number;
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    is_active: boolean;
    timezone: string;
    currency: string;
    created_at: string;
    users_count: number;
    students_count: number;
    batches_count: number;
    subscription?: {
        status: string;
        plan: { name: string; slug: string } | null;
    } | null;
    users: { id: number; name: string; email: string; role: string }[];
};

type Student = {
    id: number;
    name: string;
    phone: string | null;
    status: string;
};

type Batch = {
    id: number;
    name: string;
    subject: string | null;
    status: string;
};

type PageProps = {
    tenant: Tenant;
    recentStudents: Student[];
    recentBatches: Batch[];
};

export default function TenantShow({ tenant, recentStudents, recentBatches }: PageProps) {
    const [toggleDialog, setToggleDialog] = useState(false);

    const handleToggle = () => {
        router.post(`/super-admin/tenants/${tenant.id}/toggle-active`, {}, {
            onSuccess: () => {
                toast.success(`Tenant ${tenant.is_active ? 'deactivated' : 'activated'} successfully`);
            },
        });
        setToggleDialog(false);
    };

    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                            <ArrowLeft className="size-4" />
                        </Button>
                        <Heading
                            title={tenant.name}
                            description={tenant.email || 'No email'}
                        />
                    </div>
                    <Button
                        variant={tenant.is_active ? 'destructive' : 'default'}
                        onClick={() => setToggleDialog(true)}
                    >
                        {tenant.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Users</CardTitle>
                            <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{tenant.users_count}</div>
                        </CardContent>
                    </Card>
                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Students</CardTitle>
                            <GraduationCap className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{tenant.students_count}</div>
                        </CardContent>
                    </Card>
                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Batches</CardTitle>
                            <Layers className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{tenant.batches_count}</div>
                        </CardContent>
                    </Card>
                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
                            <Building2 className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-lg font-bold">
                                {tenant.subscription?.plan?.name || 'No Plan'}
                            </div>
                            <Badge variant={tenant.subscription?.status === 'active' ? 'default' : 'secondary'}>
                                {tenant.subscription?.status || 'none'}
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {tenant.users.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tenant.users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{user.role}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground">No users yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentStudents.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentStudents.map((student) => (
                                            <TableRow key={student.id}>
                                                <TableCell className="font-medium">{student.name}</TableCell>
                                                <TableCell>{student.phone || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                                                        {student.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground">No students yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ConfirmDialog
                open={toggleDialog}
                onOpenChange={setToggleDialog}
                title={tenant.is_active ? 'Deactivate Tenant' : 'Activate Tenant'}
                description={`Are you sure you want to ${tenant.is_active ? 'deactivate' : 'activate'} "${tenant.name}"? ${tenant.is_active ? 'All users will lose access.' : ''}`}
                confirmText={tenant.is_active ? 'Deactivate' : 'Activate'}
                variant={tenant.is_active ? 'destructive' : 'default'}
                onConfirm={handleToggle}
            />
        </>
    );
}

TenantShow.layout = {
    breadcrumbs: [
        { title: 'Coaching Centers', href: '/super-admin/tenants' },
        { title: 'Details' },
    ],
};
