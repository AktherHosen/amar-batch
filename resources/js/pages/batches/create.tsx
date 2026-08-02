import { Head, router, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import BatchForm from '@/components/batch-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import batches from '@/routes/batches';

export default function BatchesCreate() {
    const handleSubmit = (data: any) => {
        router.post(batches.store(), data, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Create Batch" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={batches.index()}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 size-4" />
                            Back
                        </Button>
                    </Link>
                    <Heading title="Create Batch" description="Add a new batch to the system" />
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <BatchForm onSubmit={handleSubmit} processing={false} errors={{}} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

BatchesCreate.layout = {
    breadcrumbs: [
        {
            title: 'Batches',
            href: batches.index(),
        },
        {
            title: 'Create',
            href: batches.create(),
        },
    ],
};
