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

            <div className="mx-auto max-w-4xl px-3 py-8 sm:px-6 sm:py-16 lg:py-20">
                <div className="mb-6 sm:mb-10">
                    <Badge variant="secondary" className="mb-3 sm:mb-4">
                        <BookOpen className="mr-1 h-3 w-3" />
                        {t('docs.badge')}
                    </Badge>
                    <h1 className="mb-3 text-2xl font-bold tracking-tight sm:mb-4 sm:text-4xl">
                        {t('docs.page_title')}
                    </h1>
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
                        {t('docs.page_desc')}
                    </p>
                </div>

                <div className="space-y-3 sm:space-y-6">
                    {sections.map((section) => (
                        <Card key={section.title}>
                            <CardHeader className="py-4 sm:py-6">
                                <CardTitle className="flex items-center gap-2 text-base font-bold tracking-tight sm:gap-3 sm:text-xl">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-10">
                                        <section.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>
                                    {section.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pb-5 sm:pb-6">
                                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{section.content}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="mt-6 border-primary bg-primary/5 sm:mt-12">
                    <CardContent className="px-4 py-6 text-center sm:px-8 sm:py-8">
                        <h3 className="mb-2 text-lg font-bold tracking-tight sm:text-xl">{t('docs.get_started_title')}</h3>
                        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{t('docs.get_started_desc')}</p>
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
