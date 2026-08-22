import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';

type Props = {
    count: number;
};

export default function PendingApprovals({ count }: Props) {
    const { t } = useLocale();

    if (count === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
        >
            <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10">
                            <Clock className="size-3.5 text-amber-600" />
                        </div>
                        <CardTitle className="text-sm">
                            {t('dashboard.pending_approvals') ?? 'Pending Approvals'}
                        </CardTitle>
                        <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                            {count}
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">
                        {count}{' '}
                        {count === 1
                            ? (t('dashboard.teacher_waiting') ?? 'teacher waiting for approval')
                            : (t('dashboard.teachers_waiting') ?? 'teachers waiting for approval')}
                    </p>
                    <Link href="/users" className="mt-3 block">
                        <Button variant="outline" size="sm" className="w-full justify-between">
                            {t('dashboard.review') ?? 'Review'}
                            <ChevronRight className="size-4" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </motion.div>
    );
}
