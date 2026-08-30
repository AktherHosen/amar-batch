import { Head, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { LogoUpload } from '@/components/logo-upload';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/contexts/locale-context';
import { useHasFeature } from '@/lib/features';
import settings from '@/routes/settings';

type Center = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    logo: string | null;
    timezone: string;
    currency: string;
    currency_symbol: string | null;
    academic_year: string | null;
    receipt_prefix: string | null;
    student_id_prefix: string | null;
    default_attendance: string | null;
    invoice_footer: string | null;
    primary_color: string | null;
};

type PageProps = {
    center: Center;
};

export default function TenantSettings({ center }: PageProps) {
    const { t } = useLocale();
    const hasCustomBranding = useHasFeature('custom_branding');
    const { data, setData, post, processing, errors } = useForm({
        name: center.name,
        email: center.email || '',
        phone: center.phone || '',
        address: center.address || '',
        logo: null as File | null,
        timezone: center.timezone,
        currency: center.currency,
        currency_symbol: center.currency_symbol || '৳',
        academic_year: center.academic_year || '2025-26',
        receipt_prefix: center.receipt_prefix || 'RCT',
        student_id_prefix: center.student_id_prefix || 'STU',
        default_attendance: center.default_attendance || 'manual',
        invoice_footer: center.invoice_footer || '',
        primary_color: center.primary_color || '#6366f1',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings/tenant', {
            forceFormData: true,
            onSuccess: () => {
                toast.success(t('toast.updated_successfully'));
            },
        });
    };

    const timezones = [
        'Asia/Dhaka',
        'Asia/Kolkata',
        'Asia/Karachi',
        'Asia/Kathmandu',
        'Asia/Colombo',
        'UTC',
    ];

    const currencies = [
        { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
        { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
        { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
    ];

    return (
        <>
            <Head title={t('settings.coaching_center')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    title={t('settings.coaching_center')}
                    description={t('settings.coaching_center_desc')}
                />

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        {t('settings.center_name')}
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        {t('settings.email')}
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">
                                        {t('settings.phone')}
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData('phone', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="timezone">
                                        {t('settings.timezone')}
                                    </Label>
                                    <Select
                                        value={data.timezone}
                                        onValueChange={(value) =>
                                            setData('timezone', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timezones.map((tz) => (
                                                <SelectItem key={tz} value={tz}>
                                                    {tz}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.timezone} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="currency">
                                        {t('settings.currency')}
                                    </Label>
                                    <Select
                                        value={data.currency}
                                        onValueChange={(value) =>
                                            setData('currency', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencies.map((c) => (
                                                <SelectItem
                                                    key={c.code}
                                                    value={c.code}
                                                >
                                                    {c.symbol} {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.currency} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="currency_symbol">
                                        {t('settings.currency_symbol')}
                                    </Label>
                                    <Input
                                        id="currency_symbol"
                                        value={data.currency_symbol}
                                        onChange={(e) =>
                                            setData(
                                                'currency_symbol',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="৳"
                                    />
                                    <InputError
                                        message={errors.currency_symbol}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="academic_year">
                                        {t('settings.academic_year')}
                                    </Label>
                                    <Input
                                        id="academic_year"
                                        value={data.academic_year}
                                        onChange={(e) =>
                                            setData(
                                                'academic_year',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="2025-26"
                                    />
                                    <InputError
                                        message={errors.academic_year}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="receipt_prefix">
                                        {t('settings.receipt_prefix')}
                                    </Label>
                                    <Input
                                        id="receipt_prefix"
                                        value={data.receipt_prefix}
                                        onChange={(e) =>
                                            setData(
                                                'receipt_prefix',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="RCT"
                                    />
                                    <InputError
                                        message={errors.receipt_prefix}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="student_id_prefix">
                                        {t('settings.student_id_prefix')}
                                    </Label>
                                    <Input
                                        id="student_id_prefix"
                                        value={data.student_id_prefix}
                                        onChange={(e) =>
                                            setData(
                                                'student_id_prefix',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="STU"
                                    />
                                    <InputError
                                        message={errors.student_id_prefix}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="default_attendance">
                                        {t('settings.default_attendance')}
                                    </Label>
                                    <Select
                                        value={data.default_attendance}
                                        onValueChange={(value) =>
                                            setData('default_attendance', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manual">
                                                {t('settings.manual')}
                                            </SelectItem>
                                            <SelectItem value="auto_absent">
                                                {t('settings.auto_absent')}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.default_attendance}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="invoice_footer">
                                    {t('settings.invoice_footer')}
                                </Label>
                                <Input
                                    id="invoice_footer"
                                    value={data.invoice_footer}
                                    onChange={(e) =>
                                        setData(
                                            'invoice_footer',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Thank you for your payment!"
                                />
                                <InputError message={errors.invoice_footer} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="primary_color">
                                    {t('settings.primary_color')}
                                </Label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        id="primary_color"
                                        value={data.primary_color}
                                        onChange={(e) =>
                                            setData(
                                                'primary_color',
                                                e.target.value,
                                            )
                                        }
                                        className="size-10 cursor-pointer rounded-md border"
                                    />
                                    <Input
                                        value={data.primary_color}
                                        onChange={(e) =>
                                            setData(
                                                'primary_color',
                                                e.target.value,
                                            )
                                        }
                                        className="w-32"
                                        placeholder="#6366f1"
                                    />
                                </div>
                                <InputError message={errors.primary_color} />
                            </div>

                            {hasCustomBranding && (
                                <div className="space-y-2">
                                    <LogoUpload
                                        label={t('settings.logo')}
                                        initialPreview={center.logo}
                                        onChange={(file) => setData('logo', file)}
                                        error={errors.logo}
                                    />
                                </div>
                            )}

                            {!hasCustomBranding && (
                                <div className="flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/25 p-4 text-sm text-muted-foreground">
                                    <Badge variant="outline">Pro</Badge>
                                    <span>
                                        Upgrade to Pro or Enterprise to upload a custom logo.
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    <Save className="size-4" />
                                    <span className="ml-2 hidden sm:inline">
                                        {processing
                                            ? t('actions.saving')
                                            : t('settings.save_changes')}
                                    </span>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

TenantSettings.layout = {
    breadcrumbs: [{ title: 'Coaching Center', href: settings.tenant.edit() }],
};
