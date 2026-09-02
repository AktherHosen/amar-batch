import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/contexts/locale-context';
import messages from '@/routes/messages';

type Message = {
    id: number;
    sender: { id: number; name: string };
    receiver: { id: number; name: string };
    student: { id: number; name: string } | null;
    subject: string | null;
    body: string;
    read_at: string | null;
    created_at: string;
};

type PageProps = {
    auth: { user: { id: number } };
    message: Message;
    conversation: Message[];
};

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) {
        return 'just now';
    }

    if (seconds < 3600) {
        return Math.floor(seconds / 60) + 'm ago';
    }

    if (seconds < 86400) {
        return Math.floor(seconds / 3600) + 'h ago';
    }

    if (seconds < 604800) {
        return Math.floor(seconds / 86400) + 'd ago';
    }

    return date.toLocaleDateString();
}

export default function MessageShow({ message, conversation }: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const currentUserId = auth.user.id;

    const { data, setData, post, processing } = useForm({
        body: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(messages.reply(message.id).url, {
            onSuccess: () => {
                setData('body', '');
                toast.success(t('messages.sent'));
                router.reload({ only: ['conversation'] });
            },
        });
    };

    return (
        <>
            <Head title={message.subject || t('messages.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 shrink-0"
                        onClick={() => router.get(messages.index().url)}
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    <div className="min-w-0 flex-1">
                        <Heading
                            title={message.subject || t('messages.title')}
                        />
                    </div>
                </div>

                {message.student && (
                    <div className="flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            {message.student.name}
                        </span>
                    </div>
                )}

                <Card className="flex-1">
                    <CardContent className="flex h-full flex-col p-4">
                        <div className="flex-1 space-y-4 overflow-y-auto pb-4">
                            {conversation.map((msg) => {
                                const isMine = msg.sender.id === currentUserId;

                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[75%] rounded-lg px-4 py-3 ${
                                                isMine
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted text-foreground'
                                            }`}
                                        >
                                            <p className={`text-xs font-medium ${isMine ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                                {msg.sender.name}
                                            </p>
                                            <p className="mt-1 whitespace-pre-wrap text-sm">
                                                {msg.body}
                                            </p>
                                            <p className={`mt-2 text-[10px] ${isMine ? 'text-primary-foreground/60' : 'text-muted-foreground/80'}`}>
                                                {timeAgo(msg.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t pt-4">
                            <Textarea
                                value={data.body}
                                onChange={(e) => setData('body', e.target.value)}
                                placeholder={t('messages.reply_placeholder')}
                                rows={2}
                                className="min-h-[60px] flex-1 resize-none"
                            />
                            <Button
                                type="submit"
                                disabled={processing || !data.body.trim()}
                                size="sm"
                            >
                                <Send className="size-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

MessageShow.layout = {
    breadcrumbs: [
        { title: 'Messages', href: messages.index().url },
        { title: 'View', href: '#' },
    ],
};
