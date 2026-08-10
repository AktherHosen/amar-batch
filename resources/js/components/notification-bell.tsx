import { router, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useHasFeature } from '@/lib/features';
import { useEffect, useState } from 'react';

type Notification = {
    id: number;
    title: string;
    message: string | null;
    action_url: string | null;
    read_at: string | null;
    created_at: string;
};

export function NotificationBell() {
    const hasNotifications = useHasFeature('notifications');
    const [unreadCount, setUnreadCount] = useState(0);
    const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/notifications/unread-count');
            const data = await response.json();
            setUnreadCount(data.count);
        } catch {
            // silently fail
        }
    };

    useEffect(() => {
        if (!hasNotifications) return;

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [hasNotifications]);

    if (!hasNotifications) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative size-9">
                    <Bell className="size-4" />
                    {unreadCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-medium text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between border-b px-4 py-2">
                    <span className="text-sm font-semibold">Notifications</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => router.get('/notifications')}
                    >
                        View all
                    </Button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {unreadCount === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            No new notifications
                        </div>
                    ) : (
                        <div className="p-1">
                            <DropdownMenuItem
                                className="cursor-pointer text-center text-xs text-muted-foreground"
                                onClick={() => {
                                    router.post('/notifications/read-all');
                                    setUnreadCount(0);
                                }}
                            >
                                Mark all as read
                            </DropdownMenuItem>
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
