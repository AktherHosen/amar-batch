import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FeeForm from '@/components/fee-form';
import fees from '@/routes/fees';

type Student = {
    id: number;
    name: string;
};

type Batch = {
    id: number;
    name: string;
};

type Enrollment = {
    student: Student;
    batch: Batch;
    enrolled_at: string | null;
};

type FeeStatus = {
    id: number;
    student_id: number;
    batch_id: number;
    month: number;
    year: number;
    amount_paid: number;
    notes: string | null;
};

type PageProps = {
    fee: FeeStatus;
    students: Student[];
    batches: Batch[];
    enrollments: Enrollment[];
};

export default function FeesEdit({ fee, students, batches, enrollments }: PageProps) {
    return (
        <>
            <Head title="Edit Fee Record" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading title="Edit Fee Record" description="Update fee payment details" />

                <Card>
                    <CardHeader>
                        <CardTitle>Fee Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FeeForm fee={fee} students={students} batches={batches} enrollments={enrollments} isEdit />
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
            href: fees.index.url(),
        },
        {
            title: 'Edit',
            href: '#',
        },
    ],
};
