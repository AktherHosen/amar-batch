import { Head, Link } from '@inertiajs/react';
import { XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { useLocale } from '@/contexts/locale-context';


type Props = {
    message?: string;
};

export default function PaymentCancel({ message }: Props) {
    const { t } = useLocale();

    return (
        <AppLayout>
            <Head title={t('payment.cancel_title')} />

            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="space-y-6 py-10">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                            <XCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{t('payment.cancel_title')}</h1>
                            <p className="mt-2 text-muted-foreground">
                                {message || t('payment.cancel_desc')}
                            </p>
                        </div>
                        <Button asChild className="w-full">
                            <Link href="/subscription">
                                {t('payment.go_to_subscription')}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
