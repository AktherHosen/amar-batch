import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import FeeForm from '@/components/fee-form';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';
import fees from '@/routes/fees';

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

type PageProps = {
    students: Student[];
    batches: Batch[];
    enrollments: Enrollment[];
};

export default function FeesCreate({
    students,
    batches,
    enrollments,
}: PageProps) {
    const { t } = useLocale();

    return (
        <>
            <Head title={t('fees.create')} />

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
                            title={t('fees.create')}
                            description={t('fees.desc')}
                        />
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <FeeForm
                            students={students}
                            batches={batches}
                            enrollments={enrollments}
                        />
                    </CardContent>
                </Card>
            </motion.div>
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
