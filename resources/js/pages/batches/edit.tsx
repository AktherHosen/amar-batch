import { Head, router, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import BatchForm from '@/components/batch-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import batches from '@/routes/batches';

type Batch = {
    id: number;
    name: string;
    subject: string | null;
    days: string | null;
    time: string | null;
    capacity: number;
    start_date: string | null;
    end_date: string | null;
    status: string;
};

type BatchesEditProps = {
    batch: Batch;
};

export default function BatchesEdit({ batch }: BatchesEditProps) {
    const handleSubmit = (data: any) => {
        router.put(batches.update(batch.id), data, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`Edit ${batch.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={batches.show(batch.id)}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 size-4" />
                            Back
                        </Button>
                    </Link>
                    <Heading title={`Edit ${batch.name}`} description="Update batch information" />
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <BatchForm batch={batch} onSubmit={handleSubmit} processing={false} errors={{}} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

BatchesEdit.layout = {
    breadcrumbs: [
        {
            title: 'Batches',
            href: batches.index(),
        },
        {
            title: 'Edit',
            href: '#',
        },
    ],
};
