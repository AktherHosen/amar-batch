import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title={`Receipt ${receipt.receipt_number}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4 print:hidden">
                    <Link href="/fees/receipts">
                        <Button variant="ghost" size="icon" className="size-9">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <Heading
                        title={`Receipt ${receipt.receipt_number}`}
                        description={`Generated on ${new Date(receipt.created_at).toLocaleDateString()}`}
                    />
                    <div className="ml-auto">
                        <Button onClick={handlePrint}>
                            <Printer className="mr-2 size-4" />
                            Print
                        </Button>
                    </div>
                </div>

                <Card className="print:border-0 print:shadow-none">
                    <CardContent className="p-6 print:p-0">
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-bold">{auth.user?.tenant?.name || 'Coaching Center'}</h2>
                            <p className="text-muted-foreground">Fee Receipt</p>
                        </div>

                        <div className="mb-6 grid grid-cols-2 gap-4 border-b pb-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Receipt Number</p>
                                <p className="font-semibold">{receipt.receipt_number}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Date</p>
                                <p className="font-semibold">{new Date(receipt.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="mb-6 grid grid-cols-2 gap-4 border-b pb-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Student Name</p>
                                <p className="font-semibold">{receipt.student.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p className="font-semibold">{receipt.student.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Guardian Name</p>
                                <p className="font-semibold">{receipt.student.guardian_name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Guardian Phone</p>
                                <p className="font-semibold">{receipt.student.guardian_phone || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="mb-6 grid grid-cols-2 gap-4 border-b pb-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Batch</p>
                                <p className="font-semibold">{receipt.batch.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Subject</p>
                                <p className="font-semibold">{receipt.batch.subject || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Period</p>
                                <p className="font-semibold">{MONTHS[receipt.month - 1]} {receipt.year}</p>
                            </div>
                        </div>

                        <div className="mb-6 grid grid-cols-2 gap-4 border-b pb-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Amount Due</p>
                                <p className="text-lg font-bold">${Number(receipt.amount_due).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Amount Paid</p>
                                <p className="text-lg font-bold text-green-600">${Number(receipt.amount_paid).toFixed(2)}</p>
                            </div>
                        </div>

                        {receipt.notes && (
                            <div className="mb-6 border-b pb-4">
                                <p className="text-sm text-muted-foreground">Notes</p>
                                <p>{receipt.notes}</p>
                            </div>
                        )}

                        <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Received by</p>
                                <p className="font-semibold">{receipt.creator.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-muted-foreground">Signature</p>
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
