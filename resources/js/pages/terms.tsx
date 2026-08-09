import { Head } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import PublicLayout from '@/layouts/public-layout';
import { useLocale } from '@/contexts/locale-context';

export default function Terms() {
    const { t } = useLocale();

    const sections = [
        { title: t('terms.s1_title'), content: t('terms.s1_content') },
        { title: t('terms.s2_title'), content: t('terms.s2_content') },
        { title: t('terms.s3_title'), content: t('terms.s3_content') },
        { title: t('terms.s4_title'), content: t('terms.s4_content') },
        { title: t('terms.s5_title'), content: t('terms.s5_content') },
        { title: t('terms.s6_title'), content: t('terms.s6_content') },
        { title: t('terms.s7_title'), content: t('terms.s7_content') },
    ];

    return (
        <PublicLayout>
            <Head title={t('terms.page_title')} />

            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
                <div className="mb-10">
                    <Badge variant="secondary" className="mb-4">
                        <FileText className="mr-1 h-3 w-3" />
                        Legal
                    </Badge>
                    <h1 className="mb-4 text-3xl font-bold sm:text-4xl">
                        {t('terms.page_title')}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t('terms.last_updated')}
                    </p>
                </div>

                <Card>
                    <CardContent className="space-y-8 py-8">
                        {sections.map((section, index) => (
                            <div key={section.title}>
                                {index > 0 && <Separator className="mb-8" />}
                                <h2 className="mb-3 text-xl font-semibold">{section.title}</h2>
                                <p className="text-muted-foreground">{section.content}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}
