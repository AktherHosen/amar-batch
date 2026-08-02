import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FeeForm from '@/components/fee-form';
import fees from '@/routes/fees';

type FeeStatus = {
    id: number;
    student_id: number;
    batch_id: number;
    amount_paid: number;
    amount_due: number;
    due_date: string | null;
    status: 'paid' | 'partial' | 'unpaid';
    payment_date: string | null;
    notes: string | null;
};

type Student = {
    id: number;
    name: string;
};

type Batch = {
    id: number;
    name: string;
};

type PageProps = {
    fee: FeeStatus;
    students: Student[];
    batches: Batch[];
};

export default function FeesEdit({ fee, students, batches }: PageProps) {
    return (
        <>
            <Head title="Edit Fee Record" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading title="Edit Fee Record" description="Update fee status details" />

                <Card>
                    <CardHeader>
                        <CardTitle>Fee Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FeeForm fee={fee} students={students} batches={batches} isEdit />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

FeesEdit.layout = {
    breadcrumbs: [
        {
            title: 'Fees',
            href: fees.index(),
        },
        {
            title: 'Edit',
            href: '#',
        },
    ],
};
