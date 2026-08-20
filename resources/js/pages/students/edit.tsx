import { Head, router, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import StudentForm from '@/components/student-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';
import students from '@/routes/students';
import type { Student } from '@/types';

type CoachingClass = {
    id: number;
    name: string;
    default_fee: number;
};

type StudentsEditProps = {
    student: Student;
    coachingClasses: CoachingClass[];
};

export default function StudentsEdit({
    student,
    coachingClasses,
}: StudentsEditProps) {
    const { t } = useLocale();
    const handleSubmit = (data: FormData) => {
        data.append('_method', 'PUT');
        router.post(students.update(student.id), data, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`${t('students.edit')} ${student.name}`} />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
            >
                <div className="flex items-center gap-4 min-w-0">
                    <Link href={students.show(student.id)} className="shrink-0">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 size-4" />
                            {t('actions.back')}
                        </Button>
                    </Link>
                    <div className="min-w-0">
                        <Heading
                            title={`${t('students.edit')} ${student.name}`}
                        />
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <StudentForm
                            student={student}
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

StudentsEdit.layout = {
    breadcrumbs: [
        {
            title: 'Students',
            href: students.index(),
        },
        {
            title: 'Edit',
            href: '#',
        },
    ],
};
