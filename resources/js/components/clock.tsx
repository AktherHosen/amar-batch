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

    return (
        <div className="flex items-center gap-2 text-sm">
            <div className="text-right">
                <div className="font-mono text-xs font-bold tabular-nums sm:text-lg">{time}</div>
                <div className="text-xs text-muted-foreground">{date}</div>
            </div>
        </div>
    );
}
