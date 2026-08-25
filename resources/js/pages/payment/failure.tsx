import { Head, Link } from '@inertiajs/react';
import { XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';

type Props = {
    message?: string;
};

export default function PaymentFailure({ message }: Props) {
    const { t } = useLocale();

    return (
        <>
            <Head title={t('payment.failure_title')} />

            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="space-y-6 py-10">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold sm:text-2xl">{t('payment.failure_title')}</h1>
                            <p className="mt-2 text-muted-foreground">
                                {message || t('payment.failure_desc')}
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button asChild className="w-full">
                                <Link href="/subscription">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    {t('payment.try_again')}
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/subscription">
                                    {t('payment.go_to_subscription')}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
