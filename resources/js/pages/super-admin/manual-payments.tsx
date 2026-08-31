import { router } from '@inertiajs/react';
import { CheckCircle, XCircle, Eye, DollarSign, Clock, CheckCircle2, XCircle as XCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLocale } from '@/contexts/locale-context';

type Payment = {
    id: number;
    txid: string | null;
    amount: number;
    currency: string;
    status: string;
    payment_method: string | null;
    billing_type: string;
    gateway_response: Record<string, any> | null;
    paid_at: string | null;
    created_at: string;
    tenant: { id: number; name: string } | null;
    plan: { id: number; name: string } | null;
};

type PageProps = {
    payments: {
        data: Payment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };
};

export default function ManualPaymentsPage({ payments: pagination, stats }: PageProps) {
    const { t, formatCurrency } = useLocale();
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [approveDialog, setApproveDialog] = useState<{ open: boolean; item: Payment | null }>({ open: false, item: null });
    const [rejectDialog, setRejectDialog] = useState<{ open: boolean; item: Payment | null }>({ open: false, item: null });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return <Badge className="bg-green-600 text-white whitespace-nowrap">{t('super_admin.approved')}</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-600 text-white whitespace-nowrap">{t('super_admin.pending')}</Badge>;
            case 'failed':
                return <Badge className="bg-red-600 text-white whitespace-nowrap">{t('super_admin.rejected')}</Badge>;
            default:
                return <Badge variant="outline" className="whitespace-nowrap">{status}</Badge>;
        }
    };

    const handleApprove = () => {
        if (!approveDialog.item) return;
        router.post(`/dashboard/manual-payments/${approveDialog.item.id}/approve`, {}, {
            onSuccess: () => {
                toast.success(t('toast.updated_successfully'));
                setApproveDialog({ open: false, item: null });
            },
        });
    };

    const handleReject = () => {
        if (!rejectDialog.item) return;
        router.post(`/dashboard/manual-payments/${rejectDialog.item.id}/reject`, {}, {
            onSuccess: () => {
                toast.success(t('toast.updated_successfully'));
                setRejectDialog({ open: false, item: null });
            },
        });
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-3 sm:p-4">
            <div className="flex items-start justify-between">
                <Heading title={t('super_admin.manual_payments')} description={t('super_admin.manual_payments_desc')} />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">{t('super_admin.total')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold sm:text-2xl">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-1 text-xs font-medium text-muted-foreground sm:text-sm">
                            <Clock className="size-3.5" /> {t('super_admin.pending')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold sm:text-2xl">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-1 text-xs font-medium text-muted-foreground sm:text-sm">
                            <CheckCircle2 className="size-3.5 text-green-600" /> {t('super_admin.approved')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold sm:text-2xl">{stats.approved}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-1 text-xs font-medium text-muted-foreground sm:text-sm">
                            <XCircleIcon className="size-3.5 text-red-600" /> {t('super_admin.rejected')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold sm:text-2xl">{stats.rejected}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="overflow-x-auto pt-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-muted-foreground">{t('super_admin.coaching_center')}</th>
                                <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-muted-foreground">{t('super_admin.plans')}</th>
                                <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-muted-foreground">{t('super_admin.amount')}</th>
                                <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-muted-foreground">{t('super_admin.billing')}</th>
                                <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-muted-foreground">TX ID</th>
                                <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-muted-foreground">{t('super_admin.status')}</th>
                                <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-muted-foreground">{t('super_admin.date')}</th>
                                <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-muted-foreground">{t('super_admin.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagination.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-2 py-8 text-center text-muted-foreground">
                                        {t('super_admin.no_manual_payments')}
                                    </td>
                                </tr>
                            ) : (
                                pagination.data.map((payment) => (
                                    <tr key={payment.id} className="border-b last:border-0">
                                        <td className="whitespace-nowrap px-2 py-2 font-medium">{payment.tenant?.name || '—'}</td>
                                        <td className="whitespace-nowrap px-2 py-2">{payment.plan?.name || '—'}</td>
                                        <td className="whitespace-nowrap px-2 py-2 font-semibold">{formatCurrency(payment.amount)}</td>
                                        <td className="whitespace-nowrap px-2 py-2 capitalize">{payment.billing_type}</td>
                                        <td className="whitespace-nowrap px-2 py-2 font-mono text-xs">
                                            {payment.gateway_response?.transaction_id || payment.txid || '—'}
                                        </td>
                                        <td className="whitespace-nowrap px-2 py-2">{getStatusBadge(payment.status)}</td>
                                        <td className="whitespace-nowrap px-2 py-2 text-muted-foreground">
                                            {new Date(payment.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="whitespace-nowrap px-2 py-2">
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="size-7 p-0"
                                                    onClick={() => { setSelectedPayment(payment); setDetailOpen(true); }}
                                                >
                                                    <Eye className="size-3.5" />
                                                </Button>
                                                {payment.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="size-7 p-0 text-green-600 hover:text-green-700"
                                                            onClick={() => setApproveDialog({ open: true, item: payment })}
                                                        >
                                                            <CheckCircle className="size-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="size-7 p-0 text-red-600 hover:text-red-700"
                                                            onClick={() => setRejectDialog({ open: true, item: payment })}
                                                        >
                                                            <XCircle className="size-3.5" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('super_admin.payment_details')}</DialogTitle>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('super_admin.coaching_center')}</span>
                                <span className="font-medium">{selectedPayment.tenant?.name || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('super_admin.plans')}</span>
                                <span className="font-medium">{selectedPayment.plan?.name || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('super_admin.amount')}</span>
                                <span className="font-semibold">{formatCurrency(selectedPayment.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('super_admin.billing')}</span>
                                <span className="capitalize">{selectedPayment.billing_type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('super_admin.status')}</span>
                                {getStatusBadge(selectedPayment.status)}
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">TX ID</span>
                                <span className="font-mono text-xs">{selectedPayment.gateway_response?.transaction_id || selectedPayment.txid || '—'}</span>
                            </div>
                            {selectedPayment.gateway_response?.sender_number && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('super_admin.sender_number')}</span>
                                    <span>{selectedPayment.gateway_response.sender_number}</span>
                                </div>
                            )}
                            {selectedPayment.gateway_response?.notes && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('super_admin.notes')}</span>
                                    <span className="text-right">{selectedPayment.gateway_response.notes}</span>
                                </div>
                            )}
                            {selectedPayment.paid_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('super_admin.paid_at')}</span>
                                    <span>{new Date(selectedPayment.paid_at).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('super_admin.submitted_at')}</span>
                                <span>{new Date(selectedPayment.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={approveDialog.open}
                onOpenChange={(open) => setApproveDialog({ open, item: approveDialog.item })}
                title={t('super_admin.approve_payment')}
                description={t('super_admin.approve_payment_confirm')}
                confirmText={t('super_admin.approve')}
                onConfirm={handleApprove}
            />

            <ConfirmDialog
                open={rejectDialog.open}
                onOpenChange={(open) => setRejectDialog({ open, item: rejectDialog.item })}
                title={t('super_admin.reject_payment')}
                description={t('super_admin.reject_payment_confirm')}
                confirmText={t('super_admin.reject')}
                variant="destructive"
                onConfirm={handleReject}
            />
        </div>
    );
}
