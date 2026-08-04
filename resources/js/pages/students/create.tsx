import { Head, router, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import StudentForm from '@/components/student-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import students from '@/routes/students';

type CoachingClass = {
    id: number;
    name: string;
    default_fee: number;
};

type PageProps = {
    coachingClasses: CoachingClass[];
};

export default function StudentsCreate({ coachingClasses }: PageProps) {
    const handleSubmit = (data: any) => {
        router.post(students.store(), data, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Create Student" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={students.index()}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 size-4" />
                            Back
                        </Button>
                    </Link>
                    <Heading title="Create Student" description="Add a new student to the system" />
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
            </div>
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
