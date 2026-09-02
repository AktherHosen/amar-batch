import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ClipboardCheck, CreditCard, Megaphone, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';

type QuickAction = {
    label: string;
    href: string;
    icon: typeof Plus;
    feature?: string;
};

const defaultActions: QuickAction[] = [
    { label: 'dashboard.add_student', href: '/students?create=true', icon: Plus },
    { label: 'dashboard.mark_attendance', href: '/attendance?create=true', icon: ClipboardCheck, feature: 'attendance' },
    { label: 'dashboard.record_payment', href: '/fees?create=true', icon: CreditCard, feature: 'fees' },
    { label: 'dashboard.post_notice', href: '/notices?create=true', icon: Megaphone, feature: 'notifications' },
];

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariant = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
};

export default function QuickActions({ features }: { features: string[] }) {
    const { t } = useLocale();

    const actions = defaultActions.filter(
        (a) => !a.feature || features.includes(a.feature),
    );

    if (actions.length === 0) {
        return null;
    }

    return (
        <>
            {/* Mobile: floating bottom nav */}
            <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-border/50 bg-background/95 px-2 py-2 backdrop-blur-md sm:hidden">
                <div className="flex items-center justify-around">
                    {actions.map((action) => {
                        const Icon = action.icon;

                        return (
                            <Link
                                key={action.href}
                                href={action.href}
                                className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <Icon className="size-5 shrink-0" />
                                <span className="w-full truncate text-center text-[10px] font-medium">
                                    {t(action.label)}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Desktop: card */}
            <motion.div
                className="hidden sm:block"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.25 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>{t('dashboard.quick_actions')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <motion.div
                            className="grid grid-cols-2 gap-2"
                            initial="hidden"
                            animate="visible"
                            variants={stagger}
                        >
                            {actions.map((action) => {
                                const Icon = action.icon;

                                return (
                                    <motion.div key={action.href} variants={itemVariant}>
                                        <Link href={action.href}>
                                            <Button variant="outline" className="w-full justify-start">
                                                <Icon className="mr-2 size-4" />
                                                {t(action.label)}
                                            </Button>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </>
    );
}
