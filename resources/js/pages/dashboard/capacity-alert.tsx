import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';
import batches from '@/routes/batches';

type Batch = {
    id: number;
    name: string;
    capacity: number;
    enrollments_count: number;
    percentage: number;
};

type Props = {
    batches: Batch[];
};

export default function CapacityAlert({ batches: lowBatches }: Props) {
    const { t } = useLocale();

    if (lowBatches.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
        >
            <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/30">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-orange-500/10">
                            <AlertTriangle className="size-3.5 text-orange-600" />
                        </div>
                        <CardTitle className="text-sm">
                            {t('dashboard.low_capacity') ?? 'Batches Near Full Capacity'}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {lowBatches.map((batch) => (
                            <Link
                                key={batch.id}
                                href={batches.show(batch.id).url}
                                className="flex items-center justify-between rounded-lg border border-orange-200/60 bg-white/50 px-3 py-2 transition-colors hover:bg-white/80 dark:border-orange-800/60 dark:bg-orange-950/20 dark:hover:bg-orange-950/40"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{batch.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {batch.enrollments_count}/{batch.capacity} students
                                    </p>
                                </div>
                                <Badge
                                    variant={batch.percentage >= 95 ? 'destructive' : 'warning'}
                                    className="shrink-0 text-[10px]"
                                >
                                    {batch.percentage}%
                                </Badge>
                            </Link>
                        ))}
                    </div>
                    <Link href={batches.index().url} className="mt-3 block text-xs text-muted-foreground hover:underline">
                        {t('actions.view_all')} →
                    </Link>
                </CardContent>
            </Card>
        </motion.div>
    );
}
