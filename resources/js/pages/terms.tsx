import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { login, register } from '@/routes';
import { useLocale } from '@/contexts/locale-context';

export default function Terms() {
    const { t } = useLocale();

    return (
        <>
            <Head title={t('terms.page_title')} />
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
                        <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
                            {t('terms.page_title')}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('terms.last_updated')}
                        </p>
                    </div>

                    <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('terms.s1_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-400">{t('terms.s1_content')}</p>
                        </section>
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('terms.s2_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-400">{t('terms.s2_content')}</p>
                        </section>
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('terms.s3_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-400">{t('terms.s3_content')}</p>
                        </section>
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('terms.s4_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-400">{t('terms.s4_content')}</p>
                        </section>
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('terms.s5_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-400">{t('terms.s5_content')}</p>
                        </section>
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('terms.s6_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-400">{t('terms.s6_content')}</p>
                        </section>
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('terms.s7_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-400">{t('terms.s7_content')}</p>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
