import { motion } from 'framer-motion';
import { Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import subscriptionRoutes from '@/routes/subscription';

type Props = {
    trialEndsAt?: string | null;
};

export default function TrialCountdownBanner({ trialEndsAt }: Props) {
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

    useEffect(() => {
        if (!trialEndsAt) return;

        const calculateTimeLeft = () => {
            const difference = new Date(trialEndsAt).getTime() - new Date().getTime();
            if (difference <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [trialEndsAt]);

    if (!trialEndsAt || !timeLeft) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between gap-3 overflow-hidden rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-2.5 text-foreground shadow-2xs backdrop-blur-md sm:px-5 sm:py-3"
        >
            <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
                    <Timer className="size-4 animate-pulse" />
                </div>
                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    <span className="text-xs font-semibold sm:text-sm">
                        Pro Trial Active:
                    </span>
                    <span className="font-mono text-xs font-bold text-destructive sm:text-sm">
                        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s remaining
                    </span>
                </div>
            </div>

            <a
                href={subscriptionRoutes.index().url}
                className="shrink-0 text-xs font-medium text-destructive underline-offset-4 hover:underline"
            >
                Upgrade now &rarr;
            </a>
        </motion.div>
    );
}
