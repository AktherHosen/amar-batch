import { motion } from 'framer-motion';
import { CloudMoon, CloudSun, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import Clock from '@/components/clock';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/contexts/locale-context';

type Props = {
    userName: string;
    subtitle: string;
    isTrial?: boolean;
    trialEndsAt?: string | null;
};

function getGreeting(t: (key: string) => string, hour: number) {
    if (hour >= 5 && hour < 12) {
        return { text: t('dashboard.good_morning'), icon: Sun };
    }

    if (hour >= 12 && hour < 17) {
        return { text: t('dashboard.good_afternoon'), icon: CloudSun };
    }

    if (hour >= 17 && hour < 21) {
        return { text: t('dashboard.good_evening'), icon: CloudMoon };
    }

    return { text: t('dashboard.good_night'), icon: Moon };
}

export default function GreetingBanner({ userName, subtitle, isTrial, trialEndsAt }: Props) {
    const { t } = useLocale();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        return () => clearInterval(timer);
    }, []);

    const greeting = getGreeting(t, currentTime.getHours());
    const GreetingIcon = greeting.icon;

    const trialDaysLeft = trialEndsAt
        ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - currentTime.getTime()) / 86400000))
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="relative overflow-hidden rounded-xl bg-primary/5 px-4 py-3 sm:px-6 sm:py-4">
                <div className="absolute -right-4 -top-4 text-primary/10">
                    <GreetingIcon className="size-24" strokeWidth={1} />
                </div>
                <div className="relative flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
                                {greeting.text}, {userName}!
                            </h1>
                            {isTrial && trialDaysLeft !== null && trialDaysLeft !== undefined && (
                                <Badge variant="warning" className="shrink-0 text-[10px]">
                                    Trial: {trialDaysLeft}d left
                                </Badge>
                            )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground sm:text-sm">
                            {subtitle}
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                        <Clock />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
