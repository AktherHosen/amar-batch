import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ChevronRight, CreditCard, UserPlus, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';
import DashboardEmptyState from './empty-state';

type ActivityItem = {
    type: 'student' | 'enrollment' | 'fee';
    title: string;
    subtitle: string;
    date: string;
    url: string;
};

const typeConfig: Record<string, { icon: typeof UserPlus; color: string; bg: string }> = {
    student: { icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    enrollment: { icon: Users, color: 'text-purple-600', bg: 'bg-purple-500/10' },
    fee: { icon: CreditCard, color: 'text-green-600', bg: 'bg-green-500/10' },
};

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) {
        return 'just now';
    }

    if (seconds < 3600) {
        return `${Math.floor(seconds / 60)}m ago`;
    }

    if (seconds < 86400) {
        return `${Math.floor(seconds / 3600)}h ago`;
    }

    if (seconds < 604800) {
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export default function ActivityFeed({ items }: { items: ActivityItem[] }) {
    const { t } = useLocale();

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.4 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboard.recent_activity') ?? 'Recent Activity'}</CardTitle>
                </CardHeader>
                <CardContent>
                    {items.length > 0 ? (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: {},
                                visible: { transition: { staggerChildren: 0.05 } },
                            }}
                        >
                            {items.map((item, idx) => {
                                const config = typeConfig[item.type] ?? typeConfig.student;
                                const Icon = config.icon;

                                return (
                                    <motion.div
                                        key={`${item.type}-${item.title}-${idx}`}
                                        variants={{
                                            hidden: { opacity: 0, x: -8 },
                                            visible: { opacity: 1, x: 0 },
                                        }}
                                    >
                                        <Link
                                            href={item.url}
                                            className={`flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50 sm:px-4 ${
                                                idx !== items.length - 1 ? 'border-b border-border/40' : ''
                                            }`}
                                        >
                                            <div
                                                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${config.bg}`}
                                            >
                                                <Icon className={`size-4 ${config.color}`} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{item.title}</p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {item.subtitle}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-1">
                                                <span className="text-[10px] text-muted-foreground">
                                                    {timeAgo(item.date)}
                                                </span>
                                                <ChevronRight className="size-3 text-muted-foreground/50" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <DashboardEmptyState
                            icon={Users}
                            title={t('dashboard.no_recent_activity') ?? 'No recent activity'}
                            description={t('dashboard.no_recent_activity_desc') ?? 'Activity will appear here as you manage your coaching center'}
                        />
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
