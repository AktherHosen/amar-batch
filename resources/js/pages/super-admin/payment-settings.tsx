import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Switch } from '@/components/ui/switch';
import { Toggle } from '@/components/ui/toggle';
import { useLocale } from '@/contexts/locale-context';
import { useForm } from '@inertiajs/react';
import { CreditCard, Power, Save, Settings } from 'lucide-react';
import { toast } from 'sonner';

type PaymentSetting = {
    id: number;
    gateway: string;
    sandbox: boolean;
    store_id: string | null;
    store_password: string | null;
    currency: string;
    online_payment_enabled: boolean;
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
        online_payment_enabled: setting.online_payment_enabled,
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
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="size-5" />
                            SSLCommerz Gateway
                        </CardTitle>
                        <Toggle
                            pressed={data.online_payment_enabled}
                            onPressedChange={(pressed) =>
                                setData('online_payment_enabled', pressed)
                            }
                            variant="outline"
                            size="sm"
                            className={`gap-1.5 ${data.online_payment_enabled ? 'border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950' : 'text-muted-foreground'}`}
                        >
                            <Power className="size-3.5" />
                            {data.online_payment_enabled
                                ? t('super_admin.enabled')
                                : t('super_admin.disabled')}
                        </Toggle>
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
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="size-5" />
                            {t('super_admin.manual_payments')}
                        </CardTitle>
                        <Toggle
                            pressed={data.manual_payment_enabled}
                            onPressedChange={(pressed) =>
                                setData('manual_payment_enabled', pressed)
                            }
                            variant="outline"
                            size="sm"
                            className={`gap-1.5 ${data.manual_payment_enabled ? 'border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950' : 'text-muted-foreground'}`}
                        >
                            <Power className="size-3.5" />
                            {data.manual_payment_enabled
                                ? t('super_admin.enabled')
                                : t('super_admin.disabled')}
                        </Toggle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="manual_payment_instructions">
                                {t('super_admin.manual_payment_instructions')}
                            </Label>
                            <RichTextEditor
                                value={data.manual_payment_instructions}
                                onChange={(value) =>
                                    setData(
                                        'manual_payment_instructions',
                                        value,
                                    )
                                }
                                placeholder={t(
                                    'super_admin.manual_payment_instructions_placeholder',
                                )}
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
