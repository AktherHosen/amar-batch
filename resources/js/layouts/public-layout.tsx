import LanguageSwitcher from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/contexts/locale-context';
import { dashboard, login, register } from '@/routes';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

type Props = {
    children: React.ReactNode;
};

export default function PublicLayout({ children }: Props) {
    const { t, formatNumber } = useLocale();
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2">
                            <img
                                src="/logo.png"
                                alt={t('app.name')}
                                className="h-8 w-8 rounded-lg object-cover"
                            />
                            <span className="hidden text-xl font-bold sm:inline-block">
                                {t('app.name')}
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                        <LanguageSwitcher />
                        {auth?.user ? (
                            <Button
                                size="sm"
                                asChild
                                className="px-2.5 sm:px-3"
                            >
                                <Link href={dashboard()}>
                                    {t('nav.dashboard')}
                                    <ArrowRight className="ml-1.5 hidden h-4 w-4 sm:ml-2 sm:inline" />
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                asChild
                                className="px-2.5 sm:px-3"
                            >
                                <Link href={login()}>
                                    {t('auth.login')}
                                    <ArrowRight className="ml-1.5 hidden h-4 w-4 sm:ml-2 sm:inline" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </nav>
            </header>

            {/* Content */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="border-t bg-muted/30 py-10 sm:py-16">
                <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <img
                                    src="/logo.png"
                                    alt={t('app.name')}
                                    className="h-8 w-8 rounded-lg object-cover"
                                />
                                <span className="font-bold">
                                    {t('app.name')}
                                </span>
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">
                                {t('welcome.hero_subtitle')}
                            </p>
                        </div>
                        <div>
                            <h4 className="mb-4 text-sm font-semibold">
                                {t('footer.product')}
                            </h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <Link
                                        href="/#features"
                                        className="hover:text-primary"
                                    >
                                        {t('welcome.about_title')}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/#pricing"
                                        className="hover:text-primary"
                                    >
                                        {t('welcome.pricing_title')}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={register()}
                                        className="hover:text-primary"
                                    >
                                        {t('welcome.cta_button')}
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="mb-4 text-sm font-semibold">
                                {t('footer.support')}
                            </h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <Link
                                        href="/contact"
                                        className="hover:text-primary"
                                    >
                                        {t('footer.contact_us')}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/docs"
                                        className="hover:text-primary"
                                    >
                                        {t('footer.documentation')}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/#faq"
                                        className="hover:text-primary"
                                    >
                                        {t('welcome.faq_title')}
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="mb-4 text-sm font-semibold">
                                {t('footer.legal')}
                            </h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <Link
                                        href="/terms"
                                        className="hover:text-primary"
                                    >
                                        {t('footer.terms')}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/privacy"
                                        className="hover:text-primary"
                                    >
                                        {t('footer.privacy')}
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
