import { motion } from 'framer-motion';
import { CloudMoon, CloudSun, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import Clock from '@/components/clock';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/contexts/locale-context';
import { useAppearance, ACCENTS } from '@/hooks/use-appearance';

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
    const { accent, resolvedAppearance } = useAppearance();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        return () => clearInterval(timer);
    }, []);

    const greeting = getGreeting(t, currentTime.getHours());
    const GreetingIcon = greeting.icon;

    const getAccentBackground = () => {
        const isPreset = accent in ACCENTS;
        if (!isPreset) {
            return resolvedAppearance === 'dark'
                ? `color-mix(in srgb, ${accent} 12%, transparent)`
                : `color-mix(in srgb, ${accent} 8%, transparent)`;
        }
        const oklch = resolvedAppearance === 'dark' ? ACCENTS[accent].dark : ACCENTS[accent].light;
        return resolvedAppearance === 'dark'
            ? `color-mix(in oklch, ${oklch} 10%, oklch(0.205 0 0))`
            : `color-mix(in oklch, ${oklch} 8%, oklch(0.985 0 0))`;
    };

    const getAccentText = () => {
        const isPreset = accent in ACCENTS;
        if (!isPreset) return accent;
        return resolvedAppearance === 'dark' ? ACCENTS[accent].dark : ACCENTS[accent].light;
    };

    const trialDaysLeft = trialEndsAt
        ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - currentTime.getTime()) / 86400000))
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div
                className="relative overflow-hidden rounded-xl px-4 py-3 sm:px-6 sm:py-4"
                style={{ backgroundColor: getAccentBackground() }}
            >
                <div className="absolute -right-4 -top-4 sm:-right-2 sm:-top-2" style={{ color: getAccentText(), opacity: 0.12 }}>
                    <GreetingIcon className="size-4 sm:size-6 md:size-8" strokeWidth={1} />
                </div>
                <div className="relative flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                            <h1 className="min-w-0 truncate text-base font-semibold tracking-tight sm:text-xl">
                                {greeting.text}, {userName}!
                            </h1>
                            {isTrial && trialDaysLeft !== null && trialDaysLeft !== undefined && (
                                <Badge variant="warning" className="shrink-0 text-[10px]">
                                    Trial: {trialDaysLeft}d left
                                </Badge>
                            )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
                            {subtitle}
                        </p>
                    </div>
                    <div className="hidden shrink-0 items-center text-xs text-muted-foreground sm:flex sm:text-sm">
                        <Clock />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
