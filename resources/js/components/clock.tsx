import { useState, useEffect } from 'react';
import { useLocale } from '@/contexts/locale-context';

export default function Clock() {
    const [now, setNow] = useState(new Date());
    const { locale } = useLocale();

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const isPM = hours >= 12;
        const h = hours % 12 || 12;
        const m = String(minutes).padStart(2, '0');
        const s = String(seconds).padStart(2, '0');
        
        if (locale === 'bn') {
            const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
            const toBn = (n: string) => n.split('').map(d => bnDigits[parseInt(d)]).join('');
            const period = isPM ? 'অপরাহ্ন' : 'পূর্বাহ্ন';

            return `${toBn(String(h))}:${toBn(m)}:${toBn(s)} ${period}`;
        }
        
        const period = isPM ? 'PM' : 'AM';

        return `${h}:${m}:${s} ${period}`;
    };

    const formatDate = (date: Date) => {
        if (locale === 'bn') {
            const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
            const toBn = (n: string) => n.split('').map(d => bnDigits[parseInt(d)]).join('');
            
            const weekdays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
            const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
            
            return `${weekdays[date.getDay()]} ${toBn(String(date.getDate()))} ${months[date.getMonth()]}`;
        }
        
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const time = formatTime(now);
    const date = formatDate(now);

    return (
        <div className="flex items-center gap-2 text-sm">
            <div className="text-right">
                <div className="font-mono text-xs font-bold tabular-nums sm:text-lg">{time}</div>
                <div className="text-xs text-muted-foreground">{date}</div>
            </div>
        </div>
    );
}
