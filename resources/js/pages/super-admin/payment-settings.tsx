import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/contexts/locale-context';
import { useForm } from '@inertiajs/react';
import { CreditCard, Save, Settings } from 'lucide-react';
import { toast } from 'sonner';

type PaymentSetting = {
    id: number;
    gateway: string;
    sandbox: boolean;
    store_id: string | null;
    store_password: string | null;
    currency: string;
    manual_payment_enabled: boolean;
    manual_payment_instructions: string | null;
};

type PageProps = {
    setting: PaymentSetting;
};

export default function PaymentSettingsPage({ setting }: PageProps) {
    const { t } = useLocale();
    const { data, setData, put, processing } = useForm({
        sandbox: setting.sandbox,
        store_id: setting.store_id || '',
        store_password: setting.store_password || '',
        currency: setting.currency,
        manual_payment_enabled: setting.manual_payment_enabled,
        manual_payment_instructions: setting.manual_payment_instructions || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/dashboard/payment-settings', {
            onSuccess: () => toast.success(t('toast.updated_successfully')),
        });
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-3 sm:p-4">
            <div className="flex items-start justify-between">
                <Heading
                    title={t('super_admin.payment_settings')}
                    description={t('super_admin.payment_settings_desc')}
                />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="size-5" />
                            SSLCommerz Gateway
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Switch
                                id="sandbox"
                                checked={data.sandbox}
                                onCheckedChange={(checked) =>
                                    setData('sandbox', checked)
                                }
                            />
                            <Label htmlFor="sandbox">
                                {t('super_admin.sandbox_mode')}
                            </Label>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="store_id">
                                    {t('super_admin.store_id')}
                                </Label>
                                <Input
                                    id="store_id"
                                    value={data.store_id}
                                    onChange={(e) =>
                                        setData('store_id', e.target.value)
                                    }
                                    placeholder="testbox"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="store_password">
                                    {t('super_admin.store_password')}
                                </Label>
                                <Input
                                    id="store_password"
                                    type="password"
                                    value={data.store_password}
                                    onChange={(e) =>
                                        setData(
                                            'store_password',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2 sm:w-1/3">
                            <Label htmlFor="currency">
                                {t('super_admin.currency')}
                            </Label>
                            <Input
                                id="currency"
                                value={data.currency}
                                onChange={(e) =>
                                    setData('currency', e.target.value)
                                }
                                placeholder="BDT"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="size-5" />
                            {t('super_admin.manual_payments')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Switch
                                id="manual_payment_enabled"
                                checked={data.manual_payment_enabled}
                                onCheckedChange={(checked) =>
                                    setData('manual_payment_enabled', checked)
                                }
                            />
                            <Label htmlFor="manual_payment_enabled">
                                {t('super_admin.enable_manual_payments')}
                            </Label>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="manual_payment_instructions">
                                {t('super_admin.manual_payment_instructions')}
                            </Label>
                            <Textarea
                                id="manual_payment_instructions"
                                value={data.manual_payment_instructions}
                                onChange={(e) =>
                                    setData(
                                        'manual_payment_instructions',
                                        e.target.value,
                                    )
                                }
                                placeholder={t(
                                    'super_admin.manual_payment_instructions_placeholder',
                                )}
                                rows={4}
                            />
                            <p className="text-xs text-muted-foreground">
                                {t(
                                    'super_admin.manual_payment_instructions_help',
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={processing}>
                        <Save className="mr-2 size-4" />
                        <span className="ml-2 hidden sm:inline">
                            {processing
                                ? t('actions.saving')
                                : t('actions.save')}
                        </span>
                    </Button>
                </div>
            </form>
        </div>
    );
}
