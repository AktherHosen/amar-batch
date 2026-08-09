import { Head, Link } from '@inertiajs/react';
import { BookOpen, Users, Calendar, DollarSign, GraduationCap, Settings, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PublicLayout from '@/layouts/public-layout';
import { register } from '@/routes';
import { useLocale } from '@/contexts/locale-context';

export default function Docs() {
    const { t } = useLocale();

    const sections = [
        {
            icon: Users,
            title: t('docs.students_title'),
            content: t('docs.students_content'),
        },
        {
            icon: GraduationCap,
            title: t('docs.batches_title'),
            content: t('docs.batches_content'),
        },
        {
            icon: Calendar,
            title: t('docs.attendance_title'),
            content: t('docs.attendance_content'),
        },
        {
            icon: DollarSign,
            title: t('docs.fees_title'),
            content: t('docs.fees_content'),
        },
        {
            icon: Shield,
            title: t('docs.roles_title'),
            content: t('docs.roles_content'),
        },
        {
            icon: Settings,
            title: t('docs.settings_title'),
            content: t('docs.settings_content'),
        },
    ];

    return (
        <PublicLayout>
            <Head title={t('docs.page_title')} />

            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
                <div className="mb-10">
                    <Badge variant="secondary" className="mb-4">
                        <BookOpen className="mr-1 h-3 w-3" />
                        {t('docs.badge')}
                    </Badge>
                    <h1 className="mb-4 text-3xl font-bold sm:text-4xl">
                        {t('docs.page_title')}
                    </h1>
                    <p className="max-w-2xl text-lg text-muted-foreground">
                        {t('docs.page_desc')}
                    </p>
                </div>

                <div className="space-y-6">
                    {sections.map((section) => (
                        <Card key={section.title}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <section.icon className="h-5 w-5" />
                                    </div>
                                    {section.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{section.content}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="mt-12 border-primary bg-primary/5">
                    <CardContent className="py-8 text-center">
                        <h3 className="mb-2 text-xl font-bold">{t('docs.get_started_title')}</h3>
                        <p className="mb-4 text-muted-foreground">{t('docs.get_started_desc')}</p>
                        <Button asChild>
                            <Link href={register()}>
                                {t('welcome.cta_button')}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}
