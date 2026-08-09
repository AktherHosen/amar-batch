import { Head, Link, usePage } from '@inertiajs/react';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
                    <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt={t('app.name')} className="h-8 w-8 rounded-lg object-cover" />
                            <span className="hidden text-xl font-bold sm:inline-block">{t('app.name')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Button asChild>
                                    <Link href={dashboard()}>
                                        {t('nav.dashboard')}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" asChild>
                                        <Link href={login()}>{t('auth.login')}</Link>
                                    </Button>
                                    <Button asChild>
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
                    <div className="relative mx-auto w-full px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-4xl text-center">
                            <Badge variant="secondary" className="mb-6">
                                <Check className="mr-1 h-3 w-3" />
                                {t('welcome.trusted_badge')}
                            </Badge>
                            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                                {t('welcome.hero_title')}
                            </h1>
                            <p className="mb-4 text-lg text-muted-foreground sm:text-xl">
                                {t('welcome.hero_subtitle')}
                            </p>
                            <p className="mb-10 max-w-2xl mx-auto text-muted-foreground">
                                {t('welcome.hero_description')}
                            </p>
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
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
                <section className="border-b bg-muted/30 py-12 sm:py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                            {displayStats.map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <stat.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
                                    <div className="text-3xl font-bold sm:text-4xl">{stat.number}</div>
                                    <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 sm:py-28">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-16 text-center">
                            <Badge variant="outline" className="mb-4">Features</Badge>
                            <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                                {t('welcome.about_title')}
                            </h2>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                {t('welcome.about_desc')}
                            </p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature) => (
                                <Card key={feature.title} className="group transition-all hover:shadow-lg hover:shadow-primary/5">
                                    <CardHeader>
                                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                            <feature.icon className="h-6 w-6" />
                                        </div>
                                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it Works Section */}
                <section className="border-y bg-muted/30 py-20 sm:py-28">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-16 text-center">
                            <Badge variant="outline" className="mb-4">How it Works</Badge>
                            <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                                {t('welcome.how_it_works_title')}
                            </h2>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                {t('welcome.how_it_works_desc')}
                            </p>
                        </div>
                        <div className="grid gap-8 md:grid-cols-3">
                            {steps.map((step, index) => (
                                <div key={step.number} className="relative text-center">
                                    {index < steps.length - 1 && (
                                        <div className="absolute top-8 left-[calc(50%+40px)] hidden h-[2px] w-[calc(100%-80px)] bg-border md:block" />
                                    )}
                                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-background">
                                        <step.icon className="h-7 w-7 text-primary" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                                    <p className="text-muted-foreground">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                {safePlans.length > 0 && (
                    <section id="pricing" className="py-20 sm:py-28">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-16 text-center">
                                <Badge variant="outline" className="mb-4">Pricing</Badge>
                                <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                                    {t('welcome.pricing_title')}
                                </h2>
                                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                    {t('welcome.pricing_desc')}
                                </p>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                {safePlans.map((plan) => (
                                    <Card
                                        key={plan.id}
                                        className={`relative flex flex-col ${
                                            plan.is_default
                                                ? 'border-primary shadow-lg shadow-primary/10'
                                                : ''
                                        }`}
                                    >
                                        {plan.is_default && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                <Badge>{t('plan.free_trial')}</Badge>
                                            </div>
                                        )}
                                        <CardHeader>
                                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                                            {plan.description && (
                                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                                            )}
                                        </CardHeader>
                                        <CardContent className="flex flex-1 flex-col">
                                            <div className="mb-6">
                                                {plan.price_monthly === 0 ? (
                                                    <div className="text-4xl font-bold">{t('plan.free')}</div>
                                                ) : (
                                                    <>
                                                        <div className="text-4xl font-bold">
                                                            {formatCurrency(plan.price_monthly)}
                                                            <span className="text-sm font-normal text-muted-foreground">/{t('plan.month')}</span>
                                                        </div>
                                                        {plan.price_yearly > 0 && (
                                                            <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                                                                {t('plan.yearly')}: {formatCurrency(plan.price_yearly)}/{t('plan.year')}
                                                            </p>
                                                        )}
                                                    </>
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
                                                variant={plan.is_default ? 'default' : 'outline'}
                                                asChild
                                            >
                                                <Link href={register()}>
                                                    {t('welcome.cta')}
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* FAQ Section */}
                <section id="faq" className="border-t bg-muted/30 py-20 sm:py-28">
                    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-16 text-center">
                            <Badge variant="outline" className="mb-4">FAQ</Badge>
                            <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                                {t('welcome.faq_title')}
                            </h2>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
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
                <section className="py-20 sm:py-28">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <Card className="overflow-hidden border-primary bg-primary text-primary-foreground">
                            <CardContent className="px-6 py-12 text-center sm:px-12 sm:py-16">
                                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                                    {t('welcome.cta_title')}
                                </h2>
                                <p className="mx-auto mb-8 max-w-xl text-lg text-primary-foreground/80">
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
                <footer className="border-t bg-muted/30 py-12 sm:py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-8 md:grid-cols-4">
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
