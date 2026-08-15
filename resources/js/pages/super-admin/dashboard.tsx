import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Building2,
    Users,
    GraduationCap,
    Layers,
    CreditCard,
    TrendingUp,
    Eye,
    MessageSquareReply,
} from 'lucide-react';
import { useLocale } from '@/contexts/locale-context';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

type Stats = {
    total_tenants: number;
    active_tenants: number;
    total_users: number;
    total_students: number;
    total_batches: number;
    active_batches: number;
    total_revenue: number;
    active_subscriptions: number;
    trial_subscriptions: number;
};

type TenantStat = {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    users_count: number;
    students_count: number;
    batches_count: number;
    subscription: {
        status: string;
        plan: { name: string } | null;
    } | null;
};

type PaymentRecord = {
    id: number;
    amount: number;
    status: string;
    billing_type: string;
    paid_at: string | null;
    created_at: string;
    tenant: { name: string } | null;
    plan: { name: string } | null;
};

type RevenueByPlan = {
    id: number;
    name: string;
    slug: string;
    successful_payments: number;
    total_revenue: number | null;
};

type ContactMessage = {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    is_read: boolean;
    created_at: string;
};

type PageProps = {
    stats: Stats;
    tenantStats: TenantStat[];
    recentPayments: PaymentRecord[];
    revenueByPlan: RevenueByPlan[];
    recentContactMessages: ContactMessage[];
};

export default function SuperAdminDashboard({ stats, tenantStats, recentPayments, revenueByPlan, recentContactMessages }: PageProps) {
    const { formatCurrency } = useLocale();

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return <Badge className="bg-green-600 text-white whitespace-nowrap">Success</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-600 text-white whitespace-nowrap">Pending</Badge>;
            case 'failed':
                return <Badge className="bg-red-600 text-white whitespace-nowrap">Failed</Badge>;
            default:
                return <Badge variant="secondary" className="whitespace-nowrap">{status}</Badge>;
        }
    };

    const getSubscriptionBadge = (tenant: TenantStat) => {
        if (!tenant.subscription) return <Badge variant="outline" className="whitespace-nowrap">No Plan</Badge>;
        const planName = tenant.subscription.plan?.name ?? 'Unknown';
        if (tenant.subscription.status === 'trial') {
            return <Badge variant="outline" className="whitespace-nowrap">Trial</Badge>;
        }
        return <Badge className="bg-blue-600 text-white whitespace-nowrap">{planName}</Badge>;
    };

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
                            <CardTitle className="text-sm font-medium">Coaching Centers</CardTitle>
                            <Building2 className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{stats.total_tenants}</div>
                            <p className="text-xs text-muted-foreground">{stats.active_tenants} active</p>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <TrendingUp className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</div>
                            <p className="text-xs text-muted-foreground">{stats.active_subscriptions} active subs</p>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <GraduationCap className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{stats.total_students}</div>
                            <p className="text-xs text-muted-foreground">{stats.total_users} users</p>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pb-1">
                            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
                            <Layers className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-3 pb-2 pt-0">
                            <div className="text-2xl font-bold">{stats.active_batches}</div>
                            <p className="text-xs text-muted-foreground">of {stats.total_batches} total</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Revenue by Plan</CardTitle>
                            <CreditCard className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {revenueByPlan.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="whitespace-nowrap">Plan</TableHead>
                                            <TableHead className="whitespace-nowrap text-right">Payments</TableHead>
                                            <TableHead className="whitespace-nowrap text-right">Revenue</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {revenueByPlan.map((plan) => (
                                            <TableRow key={plan.id}>
                                                <TableCell className="font-medium whitespace-nowrap">{plan.name}</TableCell>
                                                <TableCell className="text-right whitespace-nowrap">{plan.successful_payments}</TableCell>
                                                <TableCell className="text-right whitespace-nowrap font-semibold">
                                                    {formatCurrency(plan.total_revenue ?? 0)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground">No payment data yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center justify-between w-full">
                                <CardTitle>Recent Payments</CardTitle>
                                <Link href="/super-admin/payments" className="text-sm text-blue-600 hover:underline">
                                    View All
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recentPayments.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="whitespace-nowrap">Tenant</TableHead>
                                            <TableHead className="whitespace-nowrap">Plan</TableHead>
                                            <TableHead className="whitespace-nowrap text-right">Amount</TableHead>
                                            <TableHead className="whitespace-nowrap">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentPayments.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell className="font-medium whitespace-nowrap">
                                                    {payment.tenant?.name ?? '—'}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">{payment.plan?.name ?? '—'}</TableCell>
                                                <TableCell className="text-right whitespace-nowrap">{formatCurrency(payment.amount)}</TableCell>
                                                <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground">No payments yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Messages */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Contact Messages</CardTitle>
                        <Link href="/super-admin/contacts" className="text-sm text-blue-600 hover:underline">
                            View All
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentContactMessages.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="whitespace-nowrap">Name</TableHead>
                                        <TableHead className="whitespace-nowrap">Email</TableHead>
                                        <TableHead className="whitespace-nowrap">Subject</TableHead>
                                        <TableHead className="whitespace-nowrap">Status</TableHead>
                                        <TableHead className="whitespace-nowrap w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentContactMessages.map((message) => (
                                        <TableRow key={message.id}>
                                            <TableCell className="font-medium whitespace-nowrap">{message.name}</TableCell>
                                            <TableCell className="whitespace-nowrap">{message.email}</TableCell>
                                            <TableCell className="max-w-[200px] truncate whitespace-nowrap">{message.subject}</TableCell>
                                            <TableCell>
                                                {!message.is_read ? (
                                                    <Badge className="bg-yellow-600 text-white whitespace-nowrap">Unread</Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="whitespace-nowrap">Read</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="w-[50px]">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="size-8 p-0"
                                                    onClick={() => router.get('/super-admin/contacts')}
                                                >
                                                    <MessageSquareReply className="size-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-sm text-muted-foreground">No contact messages yet.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Coaching Centers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {tenantStats.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="whitespace-nowrap sticky left-0 bg-background z-10 min-w-[150px]">Name</TableHead>
                                        <TableHead className="whitespace-nowrap">Plan</TableHead>
                                        <TableHead className="whitespace-nowrap">Batches</TableHead>
                                        <TableHead className="whitespace-nowrap">Status</TableHead>
                                        <TableHead className="whitespace-nowrap w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tenantStats.map((tenant) => (
                                        <TableRow key={tenant.id}>
                                            <TableCell className="font-medium whitespace-nowrap sticky left-0 bg-background z-10">
                                                {tenant.name}
                                            </TableCell>
                                            <TableCell>{getSubscriptionBadge(tenant)}</TableCell>
                                            <TableCell className="whitespace-nowrap">{tenant.batches_count}</TableCell>
                                            <TableCell>
                                                <Badge variant={tenant.is_active ? 'default' : 'destructive'} className="whitespace-nowrap">
                                                    {tenant.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="w-[50px]">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="size-8 p-0"
                                                    onClick={() => router.get(`/super-admin/tenants/${tenant.id}/detail`)}
                                                >
                                                    <Eye className="size-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-sm text-muted-foreground">No coaching centers yet.</p>
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
