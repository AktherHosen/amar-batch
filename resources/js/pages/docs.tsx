import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Users, Calendar, DollarSign, GraduationCap, Settings, Shield } from 'lucide-react';
import { login, register } from '@/routes';
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
        <>
            <Head title={t('docs.page_title')} />
            <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
                {/* Navigation */}
                <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-[#0a0a0a]/80">
                    <nav className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
                        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="text-sm font-medium">{t('auth.back')}</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt={t('app.name')} className="h-8 w-8 rounded-md object-cover" />
                            <span className="font-bold text-gray-900 dark:text-white">{t('app.name')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={login()} className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                                {t('auth.login')}
                            </Link>
                            <Link href={register()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                                {t('auth.sign_up_free')}
                            </Link>
                        </div>
                    </nav>
                </header>

                {/* Content */}
                <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
                    <div className="mb-10">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            <BookOpen className="h-4 w-4" />
                            {t('docs.badge')}
                        </div>
                        <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
                            {t('docs.page_title')}
                        </h1>
                        <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                            {t('docs.page_desc')}
                        </p>
                    </div>

                    <div className="space-y-8">
                        {sections.map((section) => (
                            <div key={section.title} className="rounded-2xl border border-gray-200 p-6 sm:p-8 dark:border-gray-800">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                        <section.icon className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {section.title}
                                    </h2>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {section.content}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 rounded-2xl bg-blue-50 p-6 text-center dark:bg-blue-950/30 sm:p-8">
                        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                            {t('docs.get_started_title')}
                        </h3>
                        <p className="mb-4 text-gray-600 dark:text-gray-400">
                            {t('docs.get_started_desc')}
                        </p>
                        <Link
                            href={register()}
                            className="inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            {t('welcome.cta_button')}
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
