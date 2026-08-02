import { Head, router, Link } from '@inertiajs/react';
import { type Student } from '@/types';
import Heading from '@/components/heading';
import StudentForm from '@/components/student-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import students from '@/routes/students';

type StudentsEditProps = {
    student: Student;
};

export default function StudentsEdit({ student }: StudentsEditProps) {
    const handleSubmit = (data: any) => {
        router.put(students.update(student.id), data, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`Edit ${student.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={students.show(student.id)}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 size-4" />
                            Back
                        </Button>
                    </Link>
                    <Heading title={`Edit ${student.name}`} description="Update student information" />
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <StudentForm student={student} onSubmit={handleSubmit} processing={false} errors={{}} />
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
