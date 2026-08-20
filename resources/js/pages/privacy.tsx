import { Head } from '@inertiajs/react';
import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLocale } from '@/contexts/locale-context';
import PublicLayout from '@/layouts/public-layout';

export default function Privacy() {
    const { t } = useLocale();

    const sections = [
        { title: t('privacy.s1_title'), content: t('privacy.s1_content') },
        { title: t('privacy.s2_title'), content: t('privacy.s2_content') },
        { title: t('privacy.s3_title'), content: t('privacy.s3_content') },
        { title: t('privacy.s4_title'), content: t('privacy.s4_content') },
        { title: t('privacy.s5_title'), content: t('privacy.s5_content') },
        { title: t('privacy.s6_title'), content: t('privacy.s6_content') },
    ];

    return (
        <PublicLayout>
            <Head title={t('privacy.page_title')} />

            <div className="mx-auto max-w-4xl px-3 py-8 sm:px-6 sm:py-16 lg:py-20">
                <div className="mb-6 sm:mb-10">
                    <Badge variant="secondary" className="mb-3 sm:mb-4">
                        <Lock className="mr-1 h-3 w-3" />
                        Legal
                    </Badge>
                    <h1 className="mb-3 text-2xl font-bold tracking-tight sm:mb-4 sm:text-4xl">
                        {t('privacy.page_title')}
                    </h1>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                        {t('privacy.last_updated')}
                    </p>
                </div>

                <Card>
                    <CardContent className="space-y-6 py-5 sm:space-y-8 sm:py-8">
                        {sections.map((section, index) => (
                            <div key={section.title}>
                                {index > 0 && <Separator className="mb-6 sm:mb-8" />}
                                <h2 className="mb-2 text-base font-semibold sm:mb-3 sm:text-xl">{section.title}</h2>
                                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{section.content}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}
