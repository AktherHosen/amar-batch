import { Head, Link, usePage } from '@inertiajs/react';
import {
    Users,
    Calendar,
    DollarSign,
    GraduationCap,
    BarChart3,
    Shield,
    CheckCircle,
    Check,
    HelpCircle,
} from 'lucide-react';
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
        { number: `${formatNumber(safeStats.total_students)}+`, label: t('welcome.stat_students') },
        { number: `${formatNumber(safeStats.active_batches)}+`, label: t('welcome.stat_batches') },
        { number: `${formatNumber(safeStats.total_enrollments)}+`, label: t('welcome.stat_enrollments') },
        { number: `${formatNumber(100)}%`, label: t('welcome.stat_fees') },
    ];

    const faqs = [
        {
            q: t('welcome.faq1_q'),
            a: t('welcome.faq1_a'),
        },
        {
            q: t('welcome.faq2_q'),
            a: t('welcome.faq2_a'),
        },
        {
            q: t('welcome.faq3_q'),
            a: t('welcome.faq3_a'),
        },
        {
            q: t('welcome.faq4_q'),
            a: t('welcome.faq4_a'),
        },
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
                <meta name="keywords" content="কোচিং সেন্টার, ম্যানেজমেন্ট, ছাত্র ব্যবস্থাপনা, উপস্থিতি, বেতন, বাংলাদেশ, coaching center management, student management, attendance tracking, fee collection" />
                <meta property="og:title" content={t('welcome.hero_title')} />
                <meta property="og:description" content={t('welcome.hero_subtitle')} />
                <meta property="og:type" content="website" />
            </Head>
            <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
                {/* Navigation */}
                <header className="fixed top-0 right-0 left-0 z-50 border-b border-blue-100 bg-white/80 backdrop-blur-md dark:border-blue-900 dark:bg-[#0a0a0a]/80">
                    <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt={t('app.name')} className="h-10 w-10 shrink-0 rounded-md object-cover" />
                            <span className="hidden text-xl font-bold whitespace-nowrap text-gray-900 sm:inline dark:text-white">
                                {t('app.name')}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 sm:px-5 sm:py-2.5 dark:bg-blue-500 dark:hover:bg-blue-600"
                                >
                                    {t('nav.dashboard')}
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 sm:px-4 sm:py-2 dark:text-gray-300 dark:hover:text-white"
                                    >
                                        {t('auth.login')}
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 sm:px-5 sm:py-2.5 dark:bg-blue-500 dark:hover:bg-blue-600"
                                    >
                                        {t('auth.sign_up_free')}
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                {/* Hero Section */}
                <section className="relative flex min-h-screen items-center overflow-x-hidden overflow-y-visible">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800" />
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
                        <div className="absolute right-10 bottom-10 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
                    </div>
                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 sm:mb-6 sm:px-4 sm:py-2 sm:text-sm dark:bg-blue-900/30 dark:text-blue-300">
                                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                {t('welcome.trusted_badge')}
                            </div>
                            <h1 className="mb-4 text-2xl font-bold text-transparent sm:mb-6 sm:text-5xl lg:text-7xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text dark:from-blue-400 dark:to-indigo-400 leading-relaxed sm:leading-tight lg:leading-tight py-2">
                                {t('welcome.hero_title')}
                            </h1>
                            <p className="mx-auto mb-8 max-w-2xl text-base text-gray-600 sm:mb-10 sm:text-lg dark:text-gray-400">
                                {t('welcome.hero_subtitle')}
                            </p>
                            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
                                    >
                                        {t('nav.dashboard')}
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={register()}
                                            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
                                        >
                                            {t('welcome.cta')}
                                        </Link>
                                        <Link
                                            href={login()}
                                            className="w-full rounded-xl border-2 border-gray-200 px-6 py-3 text-base font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 sm:w-auto sm:px-8 sm:py-4 sm:text-lg dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
                                        >
                                            {t('welcome.contact')}
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="border-y border-blue-100 bg-blue-50/50 py-10 sm:py-16 dark:border-blue-900 dark:bg-blue-950/30">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 gap-4 sm:gap-8 md:grid-cols-4">
                            {displayStats.map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <div className="text-2xl font-bold text-blue-600 sm:text-4xl dark:text-blue-400">
                                        {stat.number}
                                    </div>
                                    <div className="mt-1 text-xs text-blue-700 sm:text-sm dark:text-blue-300">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-16 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-10 text-center sm:mb-16">
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl dark:text-white">
                                {t('welcome.about_title')}
                            </h2>
                            <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg dark:text-gray-400">
                                {t('welcome.about_desc')}
                            </p>
                        </div>
                        <div className="grid gap-4 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-lg sm:p-8 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-800"
                                >
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white sm:mb-4 sm:h-12 sm:w-12 dark:bg-blue-900/30 dark:text-blue-400">
                                        <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl dark:text-white">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it Works Section */}
                <section className="bg-blue-50 py-16 sm:py-24 dark:bg-blue-950/30">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-10 text-center sm:mb-16">
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl dark:text-white">
                                {t('welcome.how_it_works_title')}
                            </h2>
                            <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg dark:text-gray-400">
                                {t('welcome.how_it_works_desc')}
                            </p>
                        </div>
                        <div className="grid gap-8 sm:gap-8 md:grid-cols-3">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white sm:h-16 sm:w-16 sm:text-2xl">
                                    {formatNumber(1)}
                                </div>
                                <h3 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg dark:text-white">
                                    {t('welcome.step1_title')}
                                </h3>
                                <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">
                                    {t('welcome.step1_desc')}
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white sm:h-16 sm:w-16 sm:text-2xl">
                                    {formatNumber(2)}
                                </div>
                                <h3 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg dark:text-white">
                                    {t('welcome.step2_title')}
                                </h3>
                                <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">
                                    {t('welcome.step2_desc')}
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white sm:h-16 sm:w-16 sm:text-2xl">
                                    {formatNumber(3)}
                                </div>
                                <h3 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg dark:text-white">
                                    {t('welcome.step3_title')}
                                </h3>
                                <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">
                                    {t('welcome.step3_desc')}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                {safePlans.length > 0 && (
                    <section className="py-16 sm:py-24">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-10 text-center sm:mb-16">
                                <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl dark:text-white">
                                    {t('welcome.pricing_title')}
                                </h2>
                                <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg dark:text-gray-400">
                                    {t('welcome.pricing_desc')}
                                </p>
                            </div>
                            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
                                {safePlans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className={`relative rounded-2xl border p-6 transition-all sm:p-8 ${
                                            plan.is_default
                                                ? 'border-blue-600 shadow-lg shadow-blue-500/10 dark:border-blue-500'
                                                : 'border-gray-200 hover:border-blue-200 hover:shadow-lg dark:border-gray-800 dark:hover:border-blue-800'
                                        }`}
                                    >
                                        {plan.is_default && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                <span className="rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">
                                                    {t('plan.free_trial')}
                                                </span>
                                            </div>
                                        )}
                                        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                                            {plan.name}
                                        </h3>
                                        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                                            {plan.description}
                                        </p>
                                        <div className="mb-6">
                                            {plan.price_monthly === 0 ? (
                                                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                                    {t('plan.free')}
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                                        {formatCurrency(plan.price_monthly)}
                                                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/{t('plan.month')}</span>
                                                    </div>
                                                    {plan.price_yearly > 0 && (
                                                        <div className="mt-1 text-sm text-green-600 dark:text-green-400">
                                                            {t('plan.yearly')}: {formatCurrency(plan.price_yearly)}/{t('plan.year')}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <div className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                            {t('plan.limits')}
                                        </div>
                                        <ul className="mb-6 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                            {plan.max_students === -1 ? (
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    {t('plan.unlimited_students')}
                                                </li>
                                            ) : (
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    {formatNumber(plan.max_students)} {t('plan.students')}
                                                </li>
                                            )}
                                            {plan.max_staff === -1 ? (
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    {t('plan.unlimited_staff')}
                                                </li>
                                            ) : (
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    {formatNumber(plan.max_staff)} {t('plan.staff')}
                                                </li>
                                            )}
                                            {plan.max_batches === -1 ? (
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    {t('plan.unlimited_batches')}
                                                </li>
                                            ) : (
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    {formatNumber(plan.max_batches)} {t('plan.batches')}
                                                </li>
                                            )}
                                        </ul>
                                        <div className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                            {t('plan.includes')}
                                        </div>
                                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    {featureLabels[feature] || feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-6">
                                            <Link
                                                href={register()}
                                                className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors ${
                                                    plan.is_default
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                        : 'border border-gray-200 text-gray-700 hover:border-blue-200 hover:bg-blue-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-800 dark:hover:bg-blue-950/30'
                                                }`}
                                            >
                                                {t('welcome.cta')}
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* FAQ Section */}
                <section className="bg-blue-50 py-16 sm:py-24 dark:bg-blue-950/30">
                    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-10 text-center sm:mb-16">
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl dark:text-white">
                                {t('welcome.faq_title')}
                            </h2>
                            <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg dark:text-gray-400">
                                {t('welcome.faq_desc')}
                            </p>
                        </div>
                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <details
                                    key={i}
                                    className="group rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-gray-900"
                                >
                                    <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-gray-900 sm:text-lg dark:text-white">
                                        {faq.q}
                                        <HelpCircle className="h-5 w-5 shrink-0 text-gray-400 group-open:text-blue-600 dark:group-open:text-blue-400" />
                                    </summary>
                                    <p className="mt-3 text-sm text-gray-600 sm:text-base dark:text-gray-400">
                                        {faq.a}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-10 text-center shadow-2xl sm:rounded-3xl sm:px-8 sm:py-16 lg:px-16">
                            <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                                {t('welcome.cta_title')}
                            </h2>
                            <p className="mx-auto mb-6 max-w-xl text-base text-blue-100 sm:mb-8 sm:text-lg">
                                {t('welcome.cta_desc')}
                            </p>
                            {!auth.user && (
                                <Link
                                    href={register()}
                                    className="inline-block rounded-xl bg-white px-6 py-3 text-base font-semibold text-gray-900 shadow-lg hover:bg-gray-100 sm:px-8 sm:py-4 sm:text-lg"
                                >
                                    {t('welcome.cta_button')}
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-100 bg-gray-50 py-12 sm:py-16 dark:border-gray-800 dark:bg-gray-900/50">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-8 sm:gap-12 md:grid-cols-4">
                            {/* Brand */}
                            <div className="md:col-span-1">
                                <div className="flex items-center gap-2">
                                    <img src="/logo.png" alt={t('app.name')} className="h-8 w-8 rounded-md object-cover" />
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {t('app.name')}
                                    </span>
                                </div>
                                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                    {t('welcome.hero_subtitle')}
                                </p>
                            </div>

                            {/* Product */}
                            <div>
                                <h4 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wider dark:text-white">
                                    {t('footer.product')}
                                </h4>
                                <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                    <li>
                                        <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400">
                                            {t('welcome.about_title')}
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400">
                                            {t('welcome.pricing_title')}
                                        </a>
                                    </li>
                                    <li>
                                        <Link href={register()} className="hover:text-blue-600 dark:hover:text-blue-400">
                                            {t('welcome.cta_button')}
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Support */}
                            <div>
                                <h4 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wider dark:text-white">
                                    {t('footer.support')}
                                </h4>
                                <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                    <li>
                                        <Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400">
                                            {t('footer.contact_us')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs" className="hover:text-blue-600 dark:hover:text-blue-400">
                                            {t('footer.documentation')}
                                        </Link>
                                    </li>
                                    <li>
                                        <a href="#faq" className="hover:text-blue-600 dark:hover:text-blue-400">
                                            {t('welcome.faq_title')}
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Legal */}
                            <div>
                                <h4 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wider dark:text-white">
                                    {t('footer.legal')}
                                </h4>
                                <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                    <li>
                                        <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400">
                                            {t('footer.terms')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400">
                                            {t('footer.privacy')}
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-10 border-t border-gray-200 pt-6 text-center dark:border-gray-800 sm:mt-12 sm:pt-8">
                            <p className="text-xs text-gray-400 sm:text-sm dark:text-gray-500">
                                &copy; {formatNumber(new Date().getFullYear())} {t('app.name')}. {t('welcome.copyright')}
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
