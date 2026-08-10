import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { Student } from '@/types';
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

type StudentsEditProps = {
    student: Student;
    coachingClasses: CoachingClass[];
};

export default function StudentsEdit({
    student,
    coachingClasses,
}: StudentsEditProps) {
    const { t } = useLocale();
    const { put, processing, errors } = useForm();
    const handleSubmit = (data: any) => {
        put(students.update(student.id), {
            ...data,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`${t('students.edit')} ${student.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={students.show(student.id)}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 size-4" />
                            {t('actions.back')}
                        </Button>
                    </Link>
                    <Heading
                        title={`${t('students.edit')} ${student.name}`}
                        description={t('students.edit')}
                    />
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <StudentForm
                            student={student}
                            coachingClasses={coachingClasses}
                            onSubmit={handleSubmit}
                            processing={processing}
                            errors={errors as Record<string, string>}
                        />
                    </CardContent>
                </Card>
            </div>
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
