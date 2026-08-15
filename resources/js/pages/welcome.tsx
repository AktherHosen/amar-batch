import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Users,
    Calendar,
    DollarSign,
    GraduationCap,
    BarChart3,
    Shield,
    Check,
    HelpCircle,
    ArrowRight,
    Zap,
    Globe,
    Clock,
} from 'lucide-react';
import PlanBadge from '@/components/plan-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { dashboard, login, register } from '@/routes';
import { useLocale } from '@/contexts/locale-context';

type Plan = {
    id: number;
    name: string;
    slug: string;
    description: string;
    price_monthly: number;
    price_yearly: number;
    max_students: number;
    max_staff: number;
    max_batches: number;
    features: string[];
    is_default: boolean;
};

type Stats = {
    total_students: number;
    active_batches: number;
    total_enrollments: number;
};

type Props = {
    stats?: Stats;
    plans?: Plan[];
};

export default function Welcome({ stats, plans }: Props) {
    const { auth } = usePage().props;
    const { t, formatNumber, formatCurrency } = useLocale();
    const [annual, setAnnual] = useState(true);

    const safeStats = stats || {
        total_students: 0,
        active_batches: 0,
        total_enrollments: 0,
    };

    const safePlans = plans || [];

    const features = [
        {
            icon: Users,
            title: t('welcome.students_feature'),
            description: t('welcome.students_desc'),
        },
        {
            icon: Calendar,
            title: t('welcome.attendance_feature'),
            description: t('welcome.attendance_desc'),
        },
        {
            icon: DollarSign,
            title: t('welcome.fees_feature'),
            description: t('welcome.fees_desc'),
        },
        {
            icon: GraduationCap,
            title: t('welcome.batch_feature'),
            description: t('welcome.batch_desc'),
        },
        {
            icon: BarChart3,
            title: t('welcome.reports_feature'),
            description: t('welcome.reports_desc'),
        },
        {
            icon: Shield,
            title: t('welcome.role_feature'),
            description: t('welcome.role_desc'),
        },
    ];

    const displayStats = [
        { number: `${formatNumber(safeStats.total_students)}+`, label: t('welcome.stat_students'), icon: Users },
        { number: `${formatNumber(safeStats.active_batches)}+`, label: t('welcome.stat_batches'), icon: GraduationCap },
        { number: `${formatNumber(safeStats.total_enrollments)}+`, label: t('welcome.stat_enrollments'), icon: BarChart3 },
        { number: `${formatNumber(100)}%`, label: t('welcome.stat_fees'), icon: DollarSign },
    ];

    const steps = [
        {
            number: 1,
            title: t('welcome.step1_title'),
            description: t('welcome.step1_desc'),
            icon: Zap,
        },
        {
            number: 2,
            title: t('welcome.step2_title'),
            description: t('welcome.step2_desc'),
            icon: Globe,
        },
        {
            number: 3,
            title: t('welcome.step3_title'),
            description: t('welcome.step3_desc'),
            icon: Clock,
        },
    ];

    const faqs = [
        { q: t('welcome.faq1_q'), a: t('welcome.faq1_a') },
        { q: t('welcome.faq2_q'), a: t('welcome.faq2_a') },
        { q: t('welcome.faq3_q'), a: t('welcome.faq3_a') },
        { q: t('welcome.faq4_q'), a: t('welcome.faq4_a') },
    ];

    const featureLabels: Record<string, string> = {
        students: t('plan.feature_students'),
        batches: t('plan.feature_batches'),
        attendance: t('plan.feature_attendance'),
        fees: t('plan.feature_fees'),
        exams: t('plan.feature_exams'),
        reports: t('plan.feature_reports'),
        notifications: t('plan.feature_notifications'),
        custom_branding: t('plan.feature_custom_branding'),
        multi_branch: t('plan.feature_multi_branch'),
        api_access: t('plan.feature_api_access'),
    };

    return (
        <>
            <Head title={t('welcome.hero_title')}>
                <meta name="description" content={t('welcome.hero_subtitle')} />
            </Head>

            <div className="min-h-screen bg-background">
                {/* Navigation */}
                <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt={t('app.name')} className="h-8 w-8 rounded-lg object-cover" />
                            <span className="hidden text-xl font-bold sm:inline-block">{t('app.name')}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            {auth.user ? (
                                <Button asChild className="px-3 sm:px-4">
                                    <Link href={dashboard()}>
                                        {t('nav.dashboard')}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={login()}>{t('auth.login')}</Link>
                                    </Button>
                                    <Button asChild className="px-3 sm:px-4">
                                        <Link href={register()}>
                                            {t('auth.sign_up_free')}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                {/* Hero Section */}
                <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden border-b">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5" />
                    <div className="relative mx-auto w-full px-3 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-4xl text-center">
                            <Badge variant="secondary" className="mb-3 sm:mb-6">
                                <Check className="mr-1 h-3 w-3" />
                                {t('welcome.trusted_badge')}
                            </Badge>
                            <h1 className="mb-3 text-3xl font-bold tracking-tight sm:mb-6 sm:text-6xl lg:text-7xl">
                                {t('welcome.hero_title')}
                            </h1>
                            <p className="mb-3 text-sm leading-relaxed text-muted-foreground sm:mb-4 sm:text-xl sm:leading-relaxed">
                                {t('welcome.hero_subtitle')}
                            </p>
                            <p className="mb-6 mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mb-10 sm:text-base">
                                {t('welcome.hero_description')}
                            </p>
                            <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
                                {auth.user ? (
                                    <Button size="lg" asChild>
                                        <Link href={dashboard()}>
                                            {t('nav.dashboard')}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button size="lg" asChild>
                                            <Link href={register()}>
                                                {t('welcome.cta')}
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button size="lg" variant="outline" asChild>
                                            <Link href={login()}>{t('welcome.contact')}</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
                <section className="border-b bg-muted/30 py-8 sm:py-16">
                    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 sm:gap-6">
                            {displayStats.map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <stat.icon className="mx-auto mb-1.5 h-5 w-5 text-primary sm:mb-2 sm:h-6 sm:w-6" />
                                    <div className="text-xl font-bold sm:text-4xl">{stat.number}</div>
                                    <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-12 sm:py-28">
                    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                        <div className="mb-8 text-center sm:mb-16">
                            <Badge variant="outline" className="mb-3 sm:mb-4">Features</Badge>
                            <h2 className="mb-3 text-2xl font-bold tracking-tight sm:mb-4 sm:text-4xl lg:text-5xl">
                                {t('welcome.about_title')}
                            </h2>
                            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
                                {t('welcome.about_desc')}
                            </p>
                        </div>
                        <div className="grid gap-2 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature) => (
                                <Card key={feature.title} className="group transition-all hover:shadow-lg hover:shadow-primary/5">
                                    <CardHeader>
                                        <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:size-12">
                                            <feature.icon className="size-5 sm:h-6 sm:w-6" />
                                        </div>
                                        <CardTitle className="text-base font-bold tracking-tight sm:text-xl">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it Works Section */}
                <section className="border-y bg-muted/30 py-12 sm:py-28">
                    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                        <div className="mb-8 text-center sm:mb-16">
                            <Badge variant="outline" className="mb-3 sm:mb-4">How it Works</Badge>
                            <h2 className="mb-3 text-2xl font-bold tracking-tight sm:mb-4 sm:text-4xl lg:text-5xl">
                                {t('welcome.how_it_works_title')}
                            </h2>
                            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
                                {t('welcome.how_it_works_desc')}
                            </p>
                        </div>
                        <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
                            {steps.map((step, index) => (
                                <div key={step.number} className="relative text-center">
                                    {index < steps.length - 1 && (
                                        <div className="absolute top-8 left-[calc(50%+40px)] hidden h-[2px] w-[calc(100%-80px)] bg-border md:block" />
                                    )}
                                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full border-2 border-primary bg-background sm:mb-6 sm:size-16">
                                        <step.icon className="size-6 sm:h-7 sm:w-7 text-primary" />
                                    </div>
                                    <h3 className="mb-2 text-base font-bold tracking-tight sm:text-xl">{step.title}</h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                {safePlans.length > 0 && (
                    <section id="pricing" className="py-12 sm:py-28">
                        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                            <div className="mb-8 text-center sm:mb-16">
                                <Badge variant="outline" className="mb-3 sm:mb-4">Pricing</Badge>
                                <h2 className="mb-3 text-2xl font-bold tracking-tight sm:mb-4 sm:text-4xl lg:text-5xl">
                                    {t('welcome.pricing_title')}
                                </h2>
                                <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
                                    {t('welcome.pricing_desc')}
                                </p>
                                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8">
                                    <span className={`text-sm ${!annual ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{t('plan.monthly')}</span>
                                    <Switch checked={annual} onCheckedChange={setAnnual} />
                                    <span className={`text-sm ${annual ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{t('plan.yearly')}</span>
                                    {annual && <Badge variant="secondary" className="ml-1 text-green-600 dark:text-green-400">Save 17%</Badge>}
                                </div>
                            </div>
                            <div className="grid gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
                                {safePlans.map((plan) => {
                                    const isPopular = plan.slug === 'pro';
                                    const price = annual ? plan.price_yearly : plan.price_monthly;
                                    const period = annual ? t('plan.year') : t('plan.month');

                                    return (
                                        <Card
                                            key={plan.id}
                                            className={`relative flex flex-col ${
                                                isPopular
                                                    ? 'border-primary shadow-lg shadow-primary/10 scale-[1.02]'
                                                    : plan.is_default
                                                        ? 'border-muted'
                                                        : ''
                                            }`}
                                        >
                                            <PlanBadge
                                                isPopular={isPopular}
                                                isDefault={plan.is_default && !isPopular}
                                                popularLabel={t('plan.popular')}
                                                defaultLabel={t('plan.free_trial')}
                                            />
                                            <CardHeader className="flex flex-col items-start gap-1.5">
                                                <CardTitle className="text-xl font-bold tracking-tight">{plan.name}</CardTitle>
                                                {plan.description && (
                                                    <p className="text-sm leading-relaxed text-muted-foreground">{plan.description}</p>
                                                )}
                                            </CardHeader>
                                            <CardContent className="flex flex-1 flex-col">
                                                <div className="mb-6">
                                                    {price === 0 ? (
                                                        <div className="text-4xl font-bold">{t('plan.free')}</div>
                                                    ) : (
                                                        <div className="text-4xl font-bold">
                                                            {formatCurrency(price)}
                                                            <span className="text-sm font-normal text-muted-foreground">/{period}</span>
                                                        </div>
                                                    )}
                                                </div>

                                            <Separator className="mb-6" />

                                            <div className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                {t('plan.limits')}
                                            </div>
                                            <ul className="mb-6 space-y-3 text-sm">
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    {plan.max_students === -1 ? t('plan.unlimited_students') : `${plan.max_students} ${t('plan.students')}`}
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    {plan.max_staff === -1 ? t('plan.unlimited_staff') : `${plan.max_staff} ${t('plan.staff')}`}
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    {plan.max_batches === -1 ? t('plan.unlimited_batches') : `${plan.max_batches} ${t('plan.batches')}`}
                                                </li>
                                            </ul>

                                            <div className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                {t('plan.includes')}
                                            </div>
                                            <ul className="mb-6 flex-1 space-y-3 text-sm">
                                                {plan.features.map((feature) => (
                                                    <li key={feature} className="flex items-center gap-2">
                                                        <Check className="h-4 w-4 text-green-500" />
                                                        {featureLabels[feature] || feature}
                                                    </li>
                                                ))}
                                            </ul>

                                            <Button
                                                className="w-full"
                                                variant={isPopular ? 'default' : 'outline'}
                                                asChild
                                            >
                                                <Link href={register()}>
                                                    {t('welcome.cta')}
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* FAQ Section */}
                <section id="faq" className="border-t bg-muted/30 py-12 sm:py-28">
                    <div className="mx-auto max-w-3xl px-3 sm:px-6 lg:px-8">
                        <div className="mb-8 text-center sm:mb-16">
                            <Badge variant="outline" className="mb-3 sm:mb-4">FAQ</Badge>
                            <h2 className="mb-3 text-2xl font-bold tracking-tight sm:mb-4 sm:text-4xl lg:text-5xl">
                                {t('welcome.faq_title')}
                            </h2>
                            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
                                {t('welcome.faq_desc')}
                            </p>
                        </div>
                        <Accordion type="single" collapsible className="w-full">
                            {faqs.map((faq, i) => (
                                <AccordionItem key={i} value={`item-${i}`}>
                                    <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        {faq.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-12 sm:py-28">
                    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                        <Card className="overflow-hidden border-primary bg-primary text-primary-foreground">
                            <CardContent className="px-4 py-10 text-center sm:px-12 sm:py-16">
                                <h2 className="mb-3 text-2xl font-bold tracking-tight sm:mb-4 sm:text-4xl">
                                    {t('welcome.cta_title')}
                                </h2>
                                <p className="mx-auto mb-6 max-w-xl text-sm leading-relaxed text-primary-foreground/80 sm:mb-8 sm:text-lg">
                                    {t('welcome.cta_desc')}
                                </p>
                                {!auth.user && (
                                    <Button size="lg" variant="secondary" asChild>
                                        <Link href={register()}>
                                            {t('welcome.cta_button')}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t bg-muted/30 py-10 sm:py-16">
                    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <img src="/logo.png" alt={t('app.name')} className="h-8 w-8 rounded-lg object-cover" />
                                    <span className="font-bold">{t('app.name')}</span>
                                </div>
                                <p className="mt-3 text-sm text-muted-foreground">
                                    {t('welcome.hero_subtitle')}
                                </p>
                            </div>
                            <div>
                                <h4 className="mb-4 text-sm font-semibold">{t('footer.product')}</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li><a href="#features" className="hover:text-primary">{t('welcome.about_title')}</a></li>
                                    <li><a href="#pricing" className="hover:text-primary">{t('welcome.pricing_title')}</a></li>
                                    <li><Link href={register()} className="hover:text-primary">{t('welcome.cta_button')}</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-4 text-sm font-semibold">{t('footer.support')}</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li><Link href="/contact" className="hover:text-primary">{t('footer.contact_us')}</Link></li>
                                    <li><Link href="/docs" className="hover:text-primary">{t('footer.documentation')}</Link></li>
                                    <li><a href="#faq" className="hover:text-primary">{t('welcome.faq_title')}</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-4 text-sm font-semibold">{t('footer.legal')}</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li><Link href="/terms" className="hover:text-primary">{t('footer.terms')}</Link></li>
                                    <li><Link href="/privacy" className="hover:text-primary">{t('footer.privacy')}</Link></li>
                                </ul>
                            </div>
                        </div>
                        <Separator className="my-8" />
                        <div className="text-center text-sm text-muted-foreground">
                            &copy; {formatNumber(new Date().getFullYear())} {t('app.name')}. {t('welcome.copyright')}
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
