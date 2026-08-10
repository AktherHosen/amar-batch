import { Head, router, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Pagination from '@/components/pagination';
import { useLocale } from '@/contexts/locale-context';
import notifications from '@/routes/notifications';
import { Bell, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type Notification = {
    id: number;
    title: string;
    message: string | null;
    type: string;
    action_url: string | null;
    read_at: string | null;
    created_at: string;
};

type PageProps = {
    notifications: {
        data: Notification[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
};

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
    return date.toLocaleDateString();
}

export default function NotificationsIndex({ notifications: pagination }: PageProps) {
    const { t } = useLocale();
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = () => {
        setRefreshing(true);
        router.reload({ onFinish: () => setRefreshing(false) });
    };

    const markAsRead = (id: number) => {
        router.post(`/notifications/${id}/read`, {}, { preserveScroll: true });
    };

    const markAllAsRead = () => {
        router.post('/notifications/read-all', {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(t('notifications.all_read')),
        });
    };

    const unreadCount = pagination.data.filter((n) => !n.read_at).length;

    return (
        <>
            <Head title={t('notifications.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('notifications.title')}
                        description={`${unreadCount} ${t('notifications.unread')}`}
                    />
                    {unreadCount > 0 && (
                        <Button variant="outline" size="sm" onClick={markAllAsRead}>
                            <CheckCheck className="mr-2 size-4" />
                            {t('notifications.mark_all_read')}
                        </Button>
                    )}
                </div>

                <Card>
                    <CardContent className="pt-6">
                        {pagination.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Bell className="mb-4 size-12" />
                                <p>{t('notifications.no_notifications')}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {pagination.data.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                                            !notification.read_at ? 'bg-primary/5' : ''
                                        }`}
                                    >
                                        <div className={`mt-1 size-2 shrink-0 rounded-full ${!notification.read_at ? 'bg-primary' : 'bg-muted'}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className={`text-sm font-medium ${!notification.read_at ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {notification.title}
                                                </h3>
                                                <span className="shrink-0 text-xs text-muted-foreground">
                                                    {timeAgo(notification.created_at)}
                                                </span>
                                            </div>
                                            {notification.message && (
                                                <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                                            )}
                                            <div className="mt-2 flex items-center gap-2">
                                                {!notification.read_at && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs"
                                                        onClick={() => markAsRead(notification.id)}
                                                    >
                                                        {t('notifications.mark_read')}
                                                    </Button>
                                                )}
                                                {notification.action_url && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs"
                                                        onClick={() => router.visit(notification.action_url!)}
                                                    >
                                                        {t('notifications.view')}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Pagination
                            currentPage={pagination.current_page}
                            lastPage={pagination.last_page}
                            total={pagination.total}
                            perPage={pagination.per_page}
                            itemName="notifications"
                            baseUrl="/notifications"
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

NotificationsIndex.layout = {
    breadcrumbs: [{ title: 'Notifications', href: notifications.index() }],
};
