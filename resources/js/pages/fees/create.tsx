import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FeeForm from '@/components/fee-form';
import fees from '@/routes/fees';
import { useLocale } from '@/contexts/locale-context';

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
    const { t } = useLocale();
    return (
        <>
            <Head title={t('fees.create')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading title={t('fees.create')} description={t('fees.title')} />

                <Card>
                    <CardHeader>
                        <CardTitle>{t('fees.title')}</CardTitle>
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
