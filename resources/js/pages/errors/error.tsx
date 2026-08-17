import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Home, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { useLocale } from '@/contexts/locale-context';
import { dashboard } from '@/routes';
import { Button } from '@/components/ui/button';

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
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.3, ease: 'easeOut' },
                }}
                className="flex min-h-[60vh] items-center justify-center p-4"
            >
                <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
                    <motion.div
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            transition: {
                                delay: 0.1,
                                duration: 0.25,
                                ease: 'easeOut',
                            },
                        }}
                        className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-destructive/10"
                    >
                        <ShieldAlert className="size-8 text-destructive" />
                    </motion.div>

                    <div className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                        {status}
                    </div>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                        {title}
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {body}
                    </p>

                    <div className="mt-8 flex flex-col gap-2">
                        <Button asChild size="lg">
                            <Link href={dashboard()}>
                                <LayoutDashboard className="mr-2 size-4" />
                                {t('errors.back_to_dashboard')}
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="/">
                                <Home className="mr-2 size-4" />
                                {t('errors.go_home')}
                            </Link>
                        </Button>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
