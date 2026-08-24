import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Home, LayoutDashboard, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/contexts/locale-context';
import { dashboard } from '@/routes';

type ErrorConfig = {
    titleKey: string;
    messageKey: string;
};

const errorConfigs: Record<number, ErrorConfig> = {
    403: { titleKey: 'errors.403_title', messageKey: 'errors.403_message' },
    404: { titleKey: 'errors.404_title', messageKey: 'errors.404_message' },
    419: { titleKey: 'errors.419_title', messageKey: 'errors.419_message' },
    500: { titleKey: 'errors.500_title', messageKey: 'errors.500_message' },
};

export default function ErrorPage({
    status,
    message,
}: {
    status: number;
    message?: string | null;
}) {
    const { t } = useLocale();
    const config = errorConfigs[status] ?? {
        titleKey: 'errors.generic_title',
        messageKey: 'errors.generic_message',
    };

    const title = t(config.titleKey);
    const body = message ?? t(config.messageKey);

    return (
        <>
            <Head title={title} />
            <div className="flex min-h-[60vh] items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-center"
                    >
                        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
                            <Lock className="size-10 text-red-500 dark:text-red-400" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                            {status}
                        </p>
                        <h1 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                            {title}
                        </h1>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            {body}
                        </p>
                    </motion.div>
                    <div className="mt-8 flex flex-col gap-2.5">
                        <Button asChild>
                            <Link href={dashboard()}>
                                <LayoutDashboard className="mr-2 size-4" />
                                {t('errors.back_to_dashboard')}
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/">
                                <Home className="mr-2 size-4" />
                                {t('errors.go_home')}
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
