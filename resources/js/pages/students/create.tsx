import { Head, router, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Heading from '@/components/heading';
import StudentForm from '@/components/student-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import students from '@/routes/students';
import { useLocale } from '@/contexts/locale-context';

type CoachingClass = {
    id: number;
    name: string;
    default_fee: number;
};

type PageProps = {
    coachingClasses: CoachingClass[];
};

export default function StudentsCreate({ coachingClasses }: PageProps) {
    const { t } = useLocale();

    const handleSubmit = (data: FormData) => {
        router.post(students.store(), data, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={t('students.create')} />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
            >
                <div className="flex items-center gap-4">
                    <Link href={students.index()}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 size-4" />
                            {t('actions.back')}
                        </Button>
                    </Link>
                    <Heading
                        title={t('students.create')}
                        description={t('students.create')}
                    />
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <StudentForm
                            coachingClasses={coachingClasses}
                            onSubmit={handleSubmit}
                            processing={false}
                            errors={{}}
                        />
                    </CardContent>
                </Card>
            </motion.div>
        </>
    );
}

StudentsCreate.layout = {
    breadcrumbs: [
        {
            title: 'Students',
            href: students.index(),
        },
        {
            title: 'Create',
            href: students.create(),
        },
    ],
};
