import { Head, router, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import RolePermissionsForm from '@/components/role-permissions-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/contexts/locale-context';
import roles from '@/routes/roles';

type Role = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_system: boolean;
    permissions: string[];
};

type Props = {
    role: Role;
    groups: Record<string, Record<string, string>>;
};

export default function RolesEdit({ role, groups = {} }: Props) {
    const { t } = useLocale();
    const { errors } = usePage().props;
    const [name, setName] = useState(role.name);
    const [description, setDescription] = useState(role.description || '');
    const [selected, setSelected] = useState<string[]>(role.permissions);
    const [processing, setProcessing] = useState(false);

    const handleToggle = (route: string) => {
        setSelected((prev) =>
            prev.includes(route) ? prev.filter((r) => r !== route) : [...prev, route],
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.put(
            roles.update(role.id),
            { name, description, permissions: selected },
            {
                onSuccess: () => {
                    toast.success(t('roles.updated'));
                },
                onError: (errs) => {
                    toast.error(Object.values(errs)[0] || t('roles.save_error'));
                    setProcessing(false);
                },
            },
        );
    };

    return (
        <>
            <Head title={`${t('actions.edit')} ${role.name}`} />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
            >
                <div className="flex items-center gap-4 min-w-0">
                    <Link href={roles.index()} className="shrink-0">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div className="min-w-0">
                        <Heading title={`${t('actions.edit')} ${role.name}`} description="Choose which routes this role can access." />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Role Name *</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <div className="flex h-9 items-center justify-between rounded-md border bg-muted px-3 text-sm">
                                    <span>{role.slug}</span>
                                    {role.is_system && <Badge variant="secondary">System</Badge>}
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    rows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="mb-4 font-semibold">Route Permissions</h3>
                            <RolePermissionsForm
                                groups={groups}
                                selected={selected}
                                onToggle={handleToggle}
                            />
                            <InputError message={errors.permissions} />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" asChild>
                            <Link href={roles.index()}>{t('actions.cancel')}</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? t('roles.saving') : t('roles.update')}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </>
    );
}

RolesEdit.layout = {
    breadcrumbs: [
        {
            title: 'Roles',
            href: roles.index(),
        },
        {
            title: 'Edit',
            href: '#',
        },
    ],
};