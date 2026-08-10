import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import TeacherForm from '@/components/teacher-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import teachers from '@/routes/teachers';

export default function TeachersCreate() {
    const { post, processing, errors } = useForm();
    const handleSubmit = (data: any) => {
        post(teachers.store(), {
            ...data,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Create Teacher" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={teachers.index()}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 size-4" />
                            Back
                        </Button>
                    </Link>
                    <Heading
                        title="Create Teacher"
                        description="Add a new teacher to the system"
                    />
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <TeacherForm
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

TeachersCreate.layout = {
    breadcrumbs: [
        {
            title: 'Teachers',
            href: teachers.index(),
        },
        {
            title: 'Create',
            href: teachers.create(),
        },
    ],
};
