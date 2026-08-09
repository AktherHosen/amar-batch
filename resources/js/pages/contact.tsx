import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { login, register } from '@/routes';
import { useLocale } from '@/contexts/locale-context';

export default function Contact() {
    const { t } = useLocale();

    return (
        <>
            <Head title={t('contact.page_title')} />
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
                            {t('contact.page_title')}
                        </h1>
                        <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                            {t('contact.page_desc')}
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        {/* Contact Info */}
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{t('contact.email')}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">support@amarbatch.com</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{t('contact.phone')}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">+880 1XXX-XXXXXX</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{t('contact.address')}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{t('contact.address_value')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{t('contact.hours')}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{t('contact.hours_value')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="rounded-2xl border border-gray-200 p-6 dark:border-gray-800 sm:p-8">
                            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                                {t('contact.form_title')}
                            </h2>
                            <form className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t('contact.form_name')}
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t('contact.form_email')}
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t('contact.form_subject')}
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t('contact.form_message')}
                                    </label>
                                    <textarea
                                        id="message"
                                        rows={4}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    {t('contact.form_submit')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
