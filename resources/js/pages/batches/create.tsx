import { Head, router, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import BatchForm from '@/components/batch-form';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';
import batches from '@/routes/batches';

export default function BatchesCreate() {
    const { t } = useLocale();
    const { errors } = usePage().props;
    const handleSubmit = (data: any) => {
        router.post(batches.store(), {
            ...data,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={t('batches.create')} />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
            >
                <div className="flex items-center gap-4 min-w-0">
                    <Link href={batches.index()} className="shrink-0">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div className="min-w-0">
                        <Heading
                            title={t('batches.create')}
                            description={t('batches.desc')}
                        />
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <BatchForm
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
