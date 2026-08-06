import { useState, useEffect } from 'react';

export default function Clock() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const time = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });

    const date = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const diff = endOfDay.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return (
        <div className="flex items-center justify-between gap-2 text-sm sm:justify-start sm:gap-4">
            <div className="text-left">
                <div className="font-mono text-xs font-bold tabular-nums sm:text-lg">{time}</div>
                <div className="text-xs text-muted-foreground">{date}</div>
            </div>
            <div className="rounded-md border bg-muted/50 px-2 py-1 sm:px-3 sm:py-1.5">
                <div className="text-[10px] text-muted-foreground">End of Day</div>
                <div className="font-mono text-xs font-semibold tabular-nums sm:text-sm">
                    {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
            </div>
        </div>
    );
}
