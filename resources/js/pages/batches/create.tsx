import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import BatchForm from '@/components/batch-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import batches from '@/routes/batches';
import { useLocale } from '@/contexts/locale-context';

export default function BatchesCreate() {
    const { t } = useLocale();
    const { post, processing, errors } = useForm();
    const handleSubmit = (data: any) => {
        post(batches.store(), {
            ...data,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={t('batches.create')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={batches.index()}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 size-4" />
                            {t('actions.back')}
                        </Button>
                    </Link>
                    <Heading
                        title={t('batches.create')}
                        description={t('batches.create')}
                    />
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <BatchForm
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
