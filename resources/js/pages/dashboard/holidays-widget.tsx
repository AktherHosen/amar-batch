import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';

type Holiday = {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    type: string;
};

type Props = {
    holidays: Holiday[];
};

export default function HolidaysWidget({ holidays }: Props) {
    const { t } = useLocale();

    if (holidays.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
        >
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10">
                            <Calendar className="size-3.5 text-blue-600" />
                        </div>
                        <CardTitle>{t('dashboard.upcoming_holidays')}</CardTitle>
                    </div>
                    <Link href="/holidays" className="text-xs text-muted-foreground hover:underline">
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
                        {holidays.map((holiday, idx) => {
                            const start = new Date(holiday.start_date);
                            const end = new Date(holiday.end_date);
                            const day = start.getDate();
                            const month = start.toLocaleDateString('en', { month: 'short' });
                            const isMultiDay = start.toDateString() !== end.toDateString();

                            return (
                                <motion.div
                                    key={holiday.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 4 },
                                        visible: { opacity: 1, y: 0 },
                                    }}
                                >
                                    <Link
                                        href={`/holidays/${holiday.id}`}
                                        className={`flex items-start gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50 sm:px-4 ${
                                            idx !== holidays.length - 1 ? 'border-b border-border/40' : ''
                                        }`}
                                    >
                                        <div className="flex size-6 shrink-0 flex-col items-center justify-center rounded-md bg-blue-500/10 leading-none">
                                            <span className="text-[10px] font-bold text-blue-600">{day}</span>
                                            <span className="text-[8px] font-medium text-blue-600/70">{month}</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-sm leading-snug font-medium">{holiday.title}</h4>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {isMultiDay
                                                    ? `${start.toLocaleDateString('en', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                                    : start.toLocaleDateString('en', {
                                                          weekday: 'short',
                                                          month: 'short',
                                                          day: 'numeric',
                                                          year: 'numeric',
                                                      })}
                                            </p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`mt-0.5 shrink-0 text-[10px] font-medium ${
                                                holiday.type === 'holiday'
                                                    ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                                    : holiday.type === 'exam'
                                                      ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                      : 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                            }`}
                                        >
                                            {holiday.type}
                                        </Badge>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
