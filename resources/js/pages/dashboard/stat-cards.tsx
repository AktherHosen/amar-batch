import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';
import { cn } from '@/lib/utils';

type Trend = {
    percent: number;
    direction: 'up' | 'down' | 'neutral';
};

type StatCard = {
    title: string;
    value: number | string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    linkLabel: string;
    trend?: Trend | null;
    format?: 'number' | 'currency';
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function TrendBadge({ trend }: { trend: Trend }) {
    if (trend.direction === 'neutral') {
        return (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Minus className="size-3" />
                0%
            </span>
        );
    }

    return (
        <span
            className={cn(
                'inline-flex items-center gap-0.5 text-[10px] font-medium',
                trend.direction === 'up' && 'text-green-600',
                trend.direction === 'down' && 'text-red-600',
            )}
        >
            {trend.direction === 'up' ? (
                <TrendingUp className="size-3" />
            ) : (
                <TrendingDown className="size-3" />
            )}
            {trend.percent}%
        </span>
    );
}

export default function StatCards({ stats }: { stats: StatCard[] }) {
    const { formatCurrency } = useLocale();

    return (
        <motion.div
            className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4"
            initial="hidden"
            animate="visible"
            variants={stagger}
        >
            {stats.map((stat) => {
                const Icon = stat.icon;
                const displayValue =
                    stat.format === 'currency'
                        ? formatCurrency(Number(stat.value))
                        : stat.value;

                return (
                    <motion.div key={stat.title} variants={cardVariant}>
                        <Link href={stat.href} className="block h-full">
                            <Card className="h-full transition-colors hover:bg-muted/50">
                                <CardHeader>
                                    <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                                        {stat.title}
                                    </CardTitle>
                                    <Icon className="size-3.5 text-muted-foreground sm:size-4" />
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-end justify-between">
                                        <div className="text-xl font-bold sm:text-2xl">
                                            {displayValue}
                                        </div>
                                        {stat.trend && <TrendBadge trend={stat.trend} />}
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground hover:underline">
                                        {stat.linkLabel}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
