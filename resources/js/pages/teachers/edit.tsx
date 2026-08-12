import { Head, router, Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Heading from '@/components/heading';
import TeacherForm from '@/components/teacher-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import teachers from '@/routes/teachers';
import { useLocale } from '@/contexts/locale-context';

type Teacher = {
    id: number;
    name: string;
    email: string;
};

type TeachersEditProps = {
    teacher: Teacher;
};

export default function TeachersEdit({ teacher }: TeachersEditProps) {
    const { t } = useLocale();
    const { errors } = usePage().props;
    const handleSubmit = (data: any) => {
        router.put(teachers.update(teacher.id), {
            ...data,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`${t('actions.edit')} ${teacher.name}`} />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
            >
                <div className="flex items-center gap-4 min-w-0">
                    <Link href={teachers.show(teacher.id)} className="shrink-0">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div className="min-w-0">
                        <Heading
                            title={`${t('actions.edit')} ${teacher.name}`}
                            description={t('teachers.update_info')}
                        />
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <TeacherForm
                            teacher={teacher}
                            onSubmit={handleSubmit}
                            processing={false}
                            errors={errors}
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
