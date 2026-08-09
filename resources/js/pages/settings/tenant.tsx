import { Head, useForm, usePage } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import settings from '@/routes/settings';

type Tenant = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    logo: string | null;
    timezone: string;
    currency: string;
};

type PageProps = {
    tenant: Tenant;
};

export default function TenantSettings({ tenant }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: tenant.name,
        email: tenant.email || '',
        phone: tenant.phone || '',
        address: tenant.address || '',
        logo: null as File | null,
        timezone: tenant.timezone,
        currency: tenant.currency,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings/tenant', {
            onSuccess: () => {
                toast.success('Settings updated successfully');
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
        { code: 'USD', symbol: '$', name: 'US Dollar' },
    ];

    return (
        <>
            <Head title="Coaching Center Settings" />

            <h1 className="sr-only">Coaching Center Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Coaching Center Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <Select
                                    value={data.timezone}
                                    onValueChange={(value) => setData('timezone', value)}
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

                            <div className="grid gap-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Select
                                    value={data.currency}
                                    onValueChange={(value) => setData('currency', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currencies.map((c) => (
                                            <SelectItem key={c.code} value={c.code}>
                                                {c.symbol} {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.currency} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="logo">Logo</Label>
                            <Input
                                id="logo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('logo', e.target.files?.[0] || null)}
                            />
                            <InputError message={errors.logo} />
                            {tenant.logo && (
                                <div className="mt-2">
                                    <img
                                        src={`/storage/${tenant.logo}`}
                                        alt="Current logo"
                                        className="h-16 w-16 rounded-lg object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                {processing && <Spinner />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}

TenantSettings.layout = {
    breadcrumbs: [
        { title: 'Coaching Center', href: settings.tenant.edit() },
    ],
};
