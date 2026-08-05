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

type PageProps = {
    students: Student[];
    batches: Batch[];
    enrollments: Enrollment[];
};

export default function FeesCreate({ students, batches, enrollments }: PageProps) {
    return (
        <>
            <Head title="Add Fee Record" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading title="Add Fee Record" description="Record a monthly fee payment" />

                <Card>
                    <CardHeader>
                        <CardTitle>Fee Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FeeForm students={students} batches={batches} enrollments={enrollments} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

FeesCreate.layout = {
    breadcrumbs: [
        {
            title: 'Fees',
            href: fees.index.url(),
        },
        {
            title: 'Create',
            href: '#',
        },
    ],
};
