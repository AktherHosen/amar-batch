import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import branches from '@/routes/branches';
import { useLocale } from '@/contexts/locale-context';

type Branch = {
    id: number;
    name: string;
    code: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
};

type PageProps = { branch: Branch };

export default function BranchesEdit({ branch }: PageProps) {
    const { t } = useLocale();
    const { data, setData, put, processing, errors } = useForm({
        name: branch.name,
        code: branch.code || '',
        address: branch.address || '',
        phone: branch.phone || '',
        email: branch.email || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(branches.update(branch.id), { preserveScroll: true });
    };

    return (
        <>
            <Head title={t('branches.edit')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={branches.show(branch.id)}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 size-4" />
                            {t('actions.back')}
                        </Button>
                    </Link>
                    <Heading title={t('branches.edit')} description={t('branches.update_details')} />
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">{t('branches.name')} *</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="code">{t('branches.code')}</Label>
                                    <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} />
                                    <InputError message={errors.code} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">{t('branches.address')}</Label>
                                <Input id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                                <InputError message={errors.address} />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">{t('branches.phone')}</Label>
                                    <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                                    <InputError message={errors.phone} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">{t('branches.email')}</Label>
                                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                    <InputError message={errors.email} />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>{t('actions.save')}</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

BranchesEdit.layout = {
    breadcrumbs: [
        { title: 'Branches', href: branches.index() },
        { title: 'Edit', href: '' },
    ],
};
