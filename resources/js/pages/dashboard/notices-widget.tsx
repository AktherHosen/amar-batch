import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ChevronRight, Megaphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';

type Notice = {
    id: number;
    title: string;
    content: string;
    created_at: string;
};

type Props = {
    notices: Notice[];
};

export default function NoticesWidget({ notices }: Props) {
    const { t } = useLocale();

    if (notices.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
        >
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10">
                            <Megaphone className="size-3.5 text-amber-600" />
                        </div>
                        <CardTitle>{t('dashboard.recent_notices')}</CardTitle>
                    </div>
                    <Link href="/notices" className="text-xs text-muted-foreground hover:underline">
                        {t('actions.view_all')}
                    </Link>
                </CardHeader>
                <CardContent>
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.05 } },
                        }}
                    >
                        {notices.map((notice, idx) => (
                            <motion.div
                                key={notice.id}
                                variants={{
                                    hidden: { opacity: 0, y: 4 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                            >
                                <Link
                                    href={`/notices/${notice.id}`}
                                    className={`flex items-start gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50 sm:px-4 ${
                                        idx !== notices.length - 1 ? 'border-b border-border/40' : ''
                                    }`}
                                >
                                    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-amber-500/10">
                                        <Megaphone className="size-3 text-amber-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-sm leading-snug font-medium">{notice.title}</h4>
                                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                            {notice.content}
                                        </p>
                                    </div>
                                    <ChevronRight className="mt-1 size-3.5 shrink-0 text-muted-foreground/50" />
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
