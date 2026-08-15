import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import settings from '@/routes/settings';
import { dashboard } from '@/routes';

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
            forceFormData: true,
            onSuccess: () => {
                toast.success('Updated successfully');
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
            <Head title="Coaching Center Settings" />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
            >
                <div className="flex items-center gap-4 min-w-0">
                    <Link href={dashboard()} className="shrink-0">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div className="min-w-0">
                        <Heading
                            title="Coaching Center Settings"
                            description="Manage your coaching center information"
                        />
                    </div>
                </div>

                <Card>
                    <CardHeader className="pt-4">
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3">
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
            </motion.div>
        </>
    );
}

TenantSettings.layout = {
    breadcrumbs: [
        { title: 'Coaching Center', href: settings.tenant.edit() },
    ],
};
