import { router } from '@inertiajs/react';
import {
    Bell,
    UserPlus,
    Wallet,
    FileText,
    CheckSquare,
    BellRing,
    Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useHasFeature } from '@/lib/features';
import { useCallback, useEffect, useRef, useState } from 'react';

type Notification = {
    id: number;
    title: string;
    message: string | null;
    type: string;
    action_url: string | null;
    read_at: string | null;
    created_at: string;
};

const typeIcons: Record<string, typeof Bell> = {
    student: UserPlus,
    fee: Wallet,
    notice: FileText,
    attendance: CheckSquare,
    info: BellRing,
};

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

export function NotificationBell() {
    const hasNotifications = useHasFeature('notifications');
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const fetchedRef = useRef(false);

    const fetchCount = useCallback(async () => {
        try {
            const res = await fetch('/notifications/unread-count');
            const data = await res.json();
            setUnreadCount(data.count);
        } catch {
            // silent
        }
    }, []);

    const fetchRecent = useCallback(async () => {
        try {
            const res = await fetch('/notifications/recent');
            const data = await res.json();
            setNotifications(data.notifications);
            fetchedRef.current = true;
        } catch {
            // silent
        }
    }, []);

    useEffect(() => {
        if (!hasNotifications) return;
        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, [hasNotifications, fetchCount]);

    useEffect(() => {
        if (open) {
            fetchRecent();
        }
    }, [open, fetchRecent]);

    const handleMarkAllRead = async () => {
        try {
            await fetch('/notifications/read-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
                    ),
                },
            });
            setUnreadCount(0);
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: new Date().toISOString() })),
            );
        } catch {
            // silent
        }
    };

    const handleMarkAsRead = async (notification: Notification) => {
        if (notification.read_at) {
            if (notification.action_url) {
                router.visit(notification.action_url);
            }
            return;
        }

        try {
            await fetch(`/notifications/${notification.id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
                    ),
                },
            });
            setUnreadCount((prev) => Math.max(0, prev - 1));
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notification.id
                        ? { ...n, read_at: new Date().toISOString() }
                        : n,
                ),
            );
            if (notification.action_url) {
                router.visit(notification.action_url);
            }
        } catch {
            // silent
        }
    };

    if (!hasNotifications) {
        return null;
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
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
            <DropdownMenuContent
                align="end"
                collisionPadding={8}
                className="w-[min(20rem,calc(100vw-2rem))] overflow-x-hidden p-0 sm:w-80"
            >
                <div className="flex items-center justify-between border-b px-4 py-2.5">
                    <span className="text-sm font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={handleMarkAllRead}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                            <Bell className="mx-auto mb-2 size-8 opacity-40" />
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map((notification) => {
                            const Icon = typeIcons[notification.type] || Info;
                            const isUnread = !notification.read_at;

                            return (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={`cursor-pointer gap-3 px-4 py-3 ${isUnread ? 'bg-muted/50' : ''}`}
                                    onClick={() => handleMarkAsRead(notification)}
                                >
                                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${isUnread ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                        <Icon className="size-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={`truncate text-sm ${isUnread ? 'font-medium' : ''}`}>
                                            {notification.title}
                                        </p>
                                        {notification.message && (
                                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                {notification.message}
                                            </p>
                                        )}
                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                            {timeAgo(notification.created_at)}
                                        </p>
                                    </div>
                                    {isUnread && (
                                        <div className="size-2 shrink-0 rounded-full bg-primary" />
                                    )}
                                </DropdownMenuItem>
                            );
                        })
                    )}
                </div>
                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="p-1">
                            <DropdownMenuItem
                                className="cursor-pointer justify-center text-xs text-muted-foreground"
                                onClick={() => {
                                    setOpen(false);
                                    router.visit('/notifications');
                                }}
                            >
                                View all notifications
                            </DropdownMenuItem>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
