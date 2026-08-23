import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';

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
};

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export default function FeeReceiptShow() {
    const { receipt } = usePage<PageProps>().props;
    const { auth } = usePage().props;
    const { t, formatCurrency } = useLocale();

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title={`${t('receipts.show_title')} ${receipt.receipt_number}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4 print:hidden">
                    <Link href="/fees/receipts">
                        <Button variant="ghost" size="icon" className="size-9">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <Heading
                        title={`${t('receipts.show_title')} ${receipt.receipt_number}`}
                        description={`${t('receipts.show_generated')} ${new Date(receipt.created_at).toLocaleDateString()}`}
                    />
                    <div className="ml-auto">
                        <Button onClick={handlePrint}>
                            <Printer className="mr-2 size-4" />
                            {t('receipts.print')}
                        </Button>
                    </div>
                </div>

                <Card className="print:border-0 print:shadow-none">
                    <CardContent className="p-6 print:p-0">
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-bold">{auth.user?.tenant?.name || t('receipts.coaching_center')}</h2>
                            <p className="text-muted-foreground">{t('receipts.fee_receipt')}</p>
                        </div>

                        <div className="mb-6 grid grid-cols-2 gap-4 border-b pb-4">
                            <div>
                                <p className="text-sm text-muted-foreground">{t('receipts.receipt_number')}</p>
                                <p className="font-semibold">{receipt.receipt_number}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">{t('receipts.date')}</p>
                                <p className="font-semibold">{new Date(receipt.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="mb-6 grid grid-cols-2 gap-4 border-b pb-4">
                            <div>
                                <p className="text-sm text-muted-foreground">{t('receipts.student_name')}</p>
                                <p className="font-semibold">{receipt.student.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('receipts.phone')}</p>
                                <p className="font-semibold">{receipt.student.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('receipts.guardian_name')}</p>
                                <p className="font-semibold">{receipt.student.guardian_name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('receipts.guardian_phone')}</p>
                                <p className="font-semibold">{receipt.student.guardian_phone || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="mb-6 grid grid-cols-2 gap-4 border-b pb-4">
                            <div>
                                <p className="text-sm text-muted-foreground">{t('fees.batch')}</p>
                                <p className="font-semibold">{receipt.batch.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('receipts.subject')}</p>
                                <p className="font-semibold">{receipt.batch.subject || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('receipts.period')}</p>
                                <p className="font-semibold">{MONTHS[receipt.month - 1]} {receipt.year}</p>
                            </div>
                        </div>

                        <div className="mb-6 grid grid-cols-2 gap-4 border-b pb-4">
                            <div>
                                <p className="text-sm text-muted-foreground">{t('receipts.amount_due')}</p>
                                <p className="text-lg font-bold">{formatCurrency(Number(receipt.amount_due))}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('receipts.amount_paid')}</p>
                                <p className="text-lg font-bold text-green-600">{formatCurrency(Number(receipt.amount_paid))}</p>
                            </div>
                        </div>

                        {receipt.notes && (
                            <div className="mb-6 border-b pb-4">
                                <p className="text-sm text-muted-foreground">{t('receipts.notes')}</p>
                                <p>{receipt.notes}</p>
                            </div>
                        )}

                        <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">{t('receipts.received_by')}</p>
                                <p className="font-semibold">{receipt.creator.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-muted-foreground">{t('receipts.signature')}</p>
                                <div className="mt-8 border-t border-dashed pt-2">
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
