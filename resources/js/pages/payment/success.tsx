import { Head, Link } from '@inertiajs/react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';
import { index as subscriptionIndex } from '@/routes/subscription';

type Props = {
    payment: {
        id: number;
        amount: number;
        plan: string;
        billing_type: string;
    };
};

export default function PaymentSuccess({ payment }: Props) {
    const { t, formatCurrency } = useLocale();

    return (
        <>
            <Head title={t('payment.success_title')} />

            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="space-y-6 py-10">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{t('payment.success_title')}</h1>
                            <p className="mt-2 text-muted-foreground">{t('payment.success_desc')}</p>
                        </div>
                        <div className="rounded-lg border bg-muted/30 p-4">
                            <div className="text-sm text-muted-foreground">{t('payment.plan')}</div>
                            <div className="font-semibold">{payment.plan}</div>
                            <div className="mt-2 text-sm text-muted-foreground">{t('payment.amount_paid')}</div>
                            <div className="text-lg font-bold">{formatCurrency(payment.amount)}</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                {payment.billing_type === 'yearly' ? t('plan.yearly') : t('plan.monthly')}
                            </div>
                        </div>
                        <Button asChild className="w-full">
                            <Link href={subscriptionIndex()}>
                                {t('payment.go_to_subscription')}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
