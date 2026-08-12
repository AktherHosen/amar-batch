import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FeeForm from '@/components/fee-form';
import fees from '@/routes/fees';
import { useLocale } from '@/contexts/locale-context';

type Student = {
    id: number;
    name: string;
    coaching_class: { id: number; name: string } | null;
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

export default function FeesEdit({
    fee,
    students,
    batches,
    enrollments,
}: PageProps) {
    const { t } = useLocale();

    return (
        <>
            <Head title={t('fees.edit')} />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
            >
                <div className="flex items-center gap-4 min-w-0">
                    <Link href={fees.index.url()} className="shrink-0">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div className="min-w-0">
                        <Heading
                            title={t('fees.edit')}
                            description={t('fees.update_details')}
                        />
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <FeeForm
                            fee={fee}
                            students={students}
                            batches={batches}
                            enrollments={enrollments}
                            isEdit
                        />
                    </CardContent>
                </Card>
            </motion.div>
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
