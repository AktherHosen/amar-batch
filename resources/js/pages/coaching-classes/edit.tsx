import { Head, Link, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { ArrowLeft } from 'lucide-react';
import coachingClasses from '@/routes/coaching-classes';

type CoachingClass = {
    id: number;
    name: string;
    default_fee: number;
};

export default function CoachingClassEdit({ coachingClass }: { coachingClass: CoachingClass }) {
    const { data, setData, put, processing, errors } = useForm({
        name: coachingClass.name,
        default_fee: String(coachingClass.default_fee),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(coachingClasses.index().url + '/' + coachingClass.id);
    };

    return (
        <>
            <Head title={`Edit ${coachingClass.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={coachingClasses.index().url}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 size-4" />
                            Back
                        </Button>
                    </Link>
                    <Heading title={`Edit ${coachingClass.name}`} description="Update class details" />
                </div>

                <Card className="max-w-xl">
                    <CardHeader>
                        <CardTitle>Class Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Class Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Nursery, KG, Class 1"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="default_fee">Default Fee *</Label>
                                <Input
                                    id="default_fee"
                                    type="number"
                                    value={data.default_fee}
                                    onChange={(e) => setData('default_fee', e.target.value)}
                                    placeholder="e.g. 500"
                                    min="0"
                                />
                                <InputError message={errors.default_fee} />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Update Class'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CoachingClassEdit.layout = {
    breadcrumbs: [
        {
            title: 'Classes',
            href: coachingClasses.index().url,
        },
        {
            title: 'Edit',
            href: '#',
        },
    ],
};
