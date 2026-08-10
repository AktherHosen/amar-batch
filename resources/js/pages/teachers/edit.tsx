import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Heading from '@/components/heading';
import TeacherForm from '@/components/teacher-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import teachers from '@/routes/teachers';

type Teacher = {
    id: number;
    name: string;
    email: string;
};

type TeachersEditProps = {
    teacher: Teacher;
};

export default function TeachersEdit({ teacher }: TeachersEditProps) {
    const { put, processing, errors } = useForm();
    const handleSubmit = (data: any) => {
        put(teachers.update(teacher.id), {
            ...data,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`Edit ${teacher.name}`} />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
            >
                <div className="flex items-center gap-4">
                    <Link href={teachers.show(teacher.id)}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 size-4" />
                            Back
                        </Button>
                    </Link>
                    <Heading
                        title={`Edit ${teacher.name}`}
                        description="Update teacher information"
                    />
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <TeacherForm
                            teacher={teacher}
                            onSubmit={handleSubmit}
                            processing={processing}
                            errors={errors as Record<string, string>}
                        />
                    </CardContent>
                </Card>
            </motion.div>
        </>
    );
}

TeachersEdit.layout = {
    breadcrumbs: [
        {
            title: 'Teachers',
            href: teachers.index(),
        },
        {
            title: 'Edit',
            href: '#',
        },
    ],
};
