import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Download, Printer, FileText, User, GraduationCap, CircleDollarSign, StickyNote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
    const isFullyPaid = balance <= 0;

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        generateReceiptPDF({
            receipt,
            centerName: auth.user?.tenant?.name || '',
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

                {/* Receipt Content */}
                <Card className="print:border-0 print:shadow-none">
                    <CardContent className="p-0">
                        {/* Receipt Header Banner */}
                        <div className="border-b bg-muted/30 px-6 py-5 text-center sm:px-8 sm:py-6">
                            <div className="mb-2 flex items-center justify-center gap-2">
                                <FileText className="size-5 text-primary sm:size-6" />
                                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                                    {t('receipts.fee_receipt')}
                                </h2>
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {auth.user?.tenant?.name || t('receipts.coaching_center')}
                            </p>
                        </div>

                        <div className="space-y-0">
                            {/* Receipt Meta */}
                            <div className="grid grid-cols-2 gap-4 border-b px-6 py-4 sm:px-8">
                                <div>
                                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                                        {t('receipts.receipt_number')}
                                    </p>
                                    <p className="text-sm font-bold">{receipt.receipt_number}</p>
                                </div>
                                <div className="text-right">
                                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                                        {t('receipts.date')}
                                    </p>
                                    <p className="text-sm font-bold">
                                        {new Date(receipt.created_at).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Student Info */}
                            <div className="border-b px-6 py-4 sm:px-8">
                                <div className="mb-3 flex items-center gap-1.5">
                                    <User className="size-3.5 text-primary" />
                                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                                        {t('receipts.student_name')}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    <div>
                                        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                                            {t('receipts.student_name')}
                                        </p>
                                        <p className="text-sm font-semibold">{receipt.student.name}</p>
                                    </div>
                                    <div>
                                        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                                            {t('receipts.phone')}
                                        </p>
                                        <p className="text-sm font-semibold">{receipt.student.phone || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                                            {t('receipts.guardian_name')}
                                        </p>
                                        <p className="text-sm font-semibold">{receipt.student.guardian_name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                                            {t('receipts.guardian_phone')}
                                        </p>
                                        <p className="text-sm font-semibold">{receipt.student.guardian_phone || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Batch Info */}
                            <div className="border-b px-6 py-4 sm:px-8">
                                <div className="mb-3 flex items-center gap-1.5">
                                    <GraduationCap className="size-3.5 text-primary" />
                                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                                        {t('fees.batch')}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    <div>
                                        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                                            {t('fees.batch')}
                                        </p>
                                        <p className="text-sm font-semibold">{receipt.batch.name}</p>
                                    </div>
                                    <div>
                                        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                                            {t('receipts.subject')}
                                        </p>
                                        <p className="text-sm font-semibold">{receipt.batch.subject || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                                            {t('receipts.period')}
                                        </p>
                                        <p className="text-sm font-semibold">{MONTHS[receipt.month - 1]} {receipt.year}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Amount Summary */}
                            <div className="border-b px-6 py-5 sm:px-8">
                                <div className="mb-3 flex items-center gap-1.5">
                                    <CircleDollarSign className="size-3.5 text-primary" />
                                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                                        Payment Summary
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="rounded-lg border bg-muted/30 px-4 py-3 text-center">
                                        <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                                            {t('receipts.amount_due')}
                                        </p>
                                        <p className="text-base font-bold sm:text-lg">{formatCurrency(Number(receipt.amount_due))}</p>
                                    </div>
                                    <div className="rounded-lg border bg-green-50 px-4 py-3 text-center dark:bg-green-950/30">
                                        <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-green-700 dark:text-green-400">
                                            {t('receipts.amount_paid')}
                                        </p>
                                        <p className="text-base font-bold text-green-600 dark:text-green-400 sm:text-lg">
                                            {formatCurrency(Number(receipt.amount_paid))}
                                        </p>
                                    </div>
                                    <div className={`rounded-lg border px-4 py-3 text-center ${isFullyPaid ? 'bg-green-50 dark:bg-green-950/30' : 'bg-orange-50 dark:bg-orange-950/30'}`}>
                                        <p className={`mb-1 text-[10px] font-medium uppercase tracking-wider ${isFullyPaid ? 'text-green-700 dark:text-green-400' : 'text-orange-700 dark:text-orange-400'}`}>
                                            Balance
                                        </p>
                                        <p className={`text-base font-bold sm:text-lg ${isFullyPaid ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                            {formatCurrency(Math.max(0, balance))}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 flex justify-center">
                                    <Badge variant={isFullyPaid ? 'success' : 'danger'}>
                                        {isFullyPaid ? 'Paid in Full' : 'Partially Paid'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Notes */}
                            {receipt.notes && (
                                <div className="border-b px-6 py-4 sm:px-8">
                                    <div className="mb-2 flex items-center gap-1.5">
                                        <StickyNote className="size-3.5 text-primary" />
                                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                                            {t('receipts.notes')}
                                        </p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{receipt.notes}</p>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="px-6 py-5 sm:px-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                                            {t('receipts.received_by')}
                                        </p>
                                        <p className="text-sm font-bold">{receipt.creator.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                                            {t('receipts.signature')}
                                        </p>
                                        <div className="mt-8 border-t border-dashed pt-2 text-sm text-muted-foreground">
                                            _______________________
                                        </div>
                                    </div>
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
                    .print\\:border-0,
                    .print\\:shadow-none,
                    .print\\:p-0,
                    .print\\:hidden {
                        visibility: visible !important;
                    }
                    .print\\:border-0 {
                        border: 0 !important;
                    }
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }
                    .print\\:p-0 {
                        padding: 0 !important;
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
