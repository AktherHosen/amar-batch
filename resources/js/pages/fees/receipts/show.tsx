import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Download, Mail, Printer } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';
import { generateReceiptPDF } from '@/lib/receipt-pdf';

type Receipt = {
    id: number;
    receipt_number: string;
    student: { id: number; name: string; phone: string; guardian_name: string; guardian_phone: string };
    batch: { id: number; name: string; subject: string };
    month: number;
    year: number;
    amount_paid: number;
    amount_due: number;
    notes: string | null;
    created_at: string;
    creator: { id: number; name: string };
};

type PageProps = {
    receipt: Receipt;
    auth: { user: { tenant?: { name?: string } } };
};

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export default function FeeReceiptShow() {
    const { receipt, auth } = usePage<PageProps>().props;
    const { t, formatCurrency } = useLocale();

    const balance = Number(receipt.amount_due) - Number(receipt.amount_paid);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        generateReceiptPDF({
            receipt,
            centerName: auth.user?.tenant?.name || '',
        });
    };

    const [sending, setSending] = useState(false);

    const handleSendEmail = () => {
        setSending(true);
        router.post(`/fees/receipts/${receipt.id}/send-email`, {}, {
            preserveState: true,
            onSuccess: () => toast.success(t('receipts.email_sent')),
            onFinish: () => setSending(false),
        });
    };

    return (
        <>
            <Head title={`${t('receipts.show_title')} ${receipt.receipt_number}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex min-w-0 items-center justify-between gap-3 print:hidden">
                    <div className="flex min-w-0 items-center gap-2">
                        <Link href="/fees/receipts" className="shrink-0">
                            <Button variant="ghost" size="icon" className="size-9">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <h1 className="truncate text-lg font-bold tracking-tight sm:text-2xl">
                            {receipt.receipt_number}
                        </h1>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="icon" className="size-9 shrink-0" onClick={handleSendEmail} disabled={sending}>
                            <Mail className="size-4" />
                            <span className="sr-only">{t('receipts.send_email')}</span>
                        </Button>
                        <Button variant="outline" size="icon" className="size-9 shrink-0" onClick={handleDownloadPDF}>
                            <Download className="size-4" />
                            <span className="sr-only">{t('receipts.download_pdf')}</span>
                        </Button>
                        <Button size="icon" className="size-9 shrink-0" onClick={handlePrint}>
                            <Printer className="size-4" />
                            <span className="sr-only">{t('receipts.print')}</span>
                        </Button>
                    </div>
                </div>

                {/* Receipt */}
                <Card id="print-area" className="print:border-0 print:shadow-none">
                    <CardContent className="p-0">
                        {/* Header */}
                        <div className="border-b px-6 py-6 text-center sm:px-8">
                            <h2 className="text-lg font-bold uppercase tracking-wide sm:text-xl">
                                {auth.user?.tenant?.name || t('receipts.coaching_center')}
                            </h2>
                            <p className="mt-1 text-sm font-medium text-muted-foreground">{t('receipts.fee_receipt')}</p>
                        </div>

                        {/* Receipt info */}
                        <div className="grid grid-cols-2 gap-4 border-b px-6 py-4 sm:px-8">
                            <div>
                                <p className="text-xs text-muted-foreground">{t('receipts.receipt_number')}</p>
                                <p className="mt-0.5 text-sm font-semibold">{receipt.receipt_number}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">{t('receipts.date')}</p>
                                <p className="mt-0.5 text-sm font-semibold">
                                    {new Date(receipt.created_at).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Student & Batch in one row */}
                        <div className="grid grid-cols-1 gap-0 border-b sm:grid-cols-2">
                            <div className="border-b px-6 py-4 sm:border-b-0 sm:border-r sm:px-8">
                                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('receipts.student_name')}</p>
                                <div className="space-y-1 text-sm">
                                    <p className="font-semibold">{receipt.student.name}</p>
                                    <p className="text-muted-foreground">{receipt.student.phone || '-'}</p>
                                    {receipt.student.guardian_name && (
                                        <p className="text-muted-foreground">{receipt.student.guardian_name} &middot; {receipt.student.guardian_phone || '-'}</p>
                                    )}
                                </div>
                            </div>
                            <div className="px-6 py-4 sm:px-8">
                                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('fees.batch')}</p>
                                <div className="space-y-1 text-sm">
                                    <p className="font-semibold">{receipt.batch.name}</p>
                                    <p className="text-muted-foreground">{receipt.batch.subject || '-'}</p>
                                    <p className="text-muted-foreground">{MONTHS[receipt.month - 1]} {receipt.year}</p>
                                </div>
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="grid grid-cols-3 gap-4 border-b px-6 py-5 sm:px-8">
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground">{t('receipts.amount_due')}</p>
                                <p className="mt-1 text-base font-bold sm:text-lg">{formatCurrency(Number(receipt.amount_due))}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground">{t('receipts.amount_paid')}</p>
                                <p className="mt-1 text-base font-bold text-green-600 sm:text-lg">{formatCurrency(Number(receipt.amount_paid))}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground">Balance</p>
                                <p className={`mt-1 text-base font-bold sm:text-lg ${balance <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                    {formatCurrency(Math.max(0, balance))}
                                </p>
                            </div>
                        </div>

                        {/* Notes */}
                        {receipt.notes && (
                            <div className="border-b px-6 py-4 sm:px-8">
                                <p className="text-xs text-muted-foreground">{t('receipts.notes')}</p>
                                <p className="mt-1 text-sm">{receipt.notes}</p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="grid grid-cols-2 gap-4 px-6 py-5 sm:px-8">
                            <div>
                                <p className="text-xs text-muted-foreground">{t('receipts.received_by')}</p>
                                <p className="mt-1 text-sm font-semibold">{receipt.creator.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">{t('receipts.signature')}</p>
                                <div className="mt-8 border-t pt-2 text-sm text-muted-foreground">
                                    _______________________
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #print-area,
                    #print-area * {
                        visibility: visible;
                    }
                    #print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    @page {
                        margin: 1cm;
                    }
                }
            `}</style>
        </>
    );
}

FeeReceiptShow.layout = {
    breadcrumbs: [
        { title: 'Fees', href: '/fees' },
        { title: 'Receipts', href: '/fees/receipts' },
        { title: 'View', href: '#' },
    ],
};
