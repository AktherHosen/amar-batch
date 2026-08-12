import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import InputError from '@/components/input-error';
import coachingClasses from '@/routes/coaching-classes';
import { useLocale } from '@/contexts/locale-context';

type CoachingClass = {
    id: number;
    name: string;
    default_fee: number;
};

export default function CoachingClassEdit({
    coachingClass,
}: {
    coachingClass: CoachingClass;
}) {
    const { t } = useLocale();
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
            <Head title={`${t('actions.edit')} ${coachingClass.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4 min-w-0">
                    <Link href={coachingClasses.index().url} className="shrink-0">
                        <Button variant="ghost" size="icon" className="size-9">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div className="min-w-0">
                        <h2 className="truncate text-xl font-semibold tracking-tight">
                            {t('actions.edit')} {coachingClass.name}
                        </h2>
                    </div>
                </div>

                <Card className="max-w-xl">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    {t('classes.name')} *
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="e.g. Nursery, KG, Class 1"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="default_fee">
                                    {t('classes.default_fee')} *
                                </Label>
                                <Input
                                    id="default_fee"
                                    type="number"
                                    value={data.default_fee}
                                    onChange={(e) =>
                                        setData('default_fee', e.target.value)
                                    }
                                    placeholder="e.g. 500"
                                    min="0"
                                />
                                <InputError message={errors.default_fee} />
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? t('actions.save') + '...'
                                        : t('classes.update_class')}
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
