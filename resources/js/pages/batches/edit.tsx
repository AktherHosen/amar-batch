import { Head, router, Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Heading from '@/components/heading';
import BatchForm from '@/components/batch-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import batches from '@/routes/batches';
import { useLocale } from '@/contexts/locale-context';

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
    const { t } = useLocale();
    const { errors } = usePage().props;
    const handleSubmit = (data: any) => {
        router.put(batches.update(batch.id), {
            ...data,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`${t('actions.edit')} ${batch.name}`} />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
            >
                <div className="flex items-center gap-4 min-w-0">
                    <Link href={batches.show(batch.id)} className="shrink-0">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div className="min-w-0">
                        <Heading
                            title={`${t('actions.edit')} ${batch.name}`}
                        />
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <BatchForm
                            batch={batch}
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
