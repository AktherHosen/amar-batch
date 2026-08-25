import { Head, router, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { FormActions } from '@/components/form-actions';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import RolePermissionsForm from '@/components/role-permissions-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/contexts/locale-context';
import roles from '@/routes/roles';

type Props = {
    groups: Record<string, Record<string, string>>;
};

export default function RolesCreate({ groups = {} }: Props) {
    const { t } = useLocale();
    const { errors } = usePage().props;
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [selected, setSelected] = useState<string[]>([]);
    const [processing, setProcessing] = useState(false);

    const handleToggle = (route: string) => {
        setSelected((prev) =>
            prev.includes(route)
                ? prev.filter((r) => r !== route)
                : [...prev, route],
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(
            roles.store(),
            { name, slug, description, permissions: selected },
            {
                onSuccess: () => {
                    toast.success(t('roles.created'));
                },
                onError: (errs) => {
                    toast.error(
                        Object.values(errs)[0] || t('roles.save_error'),
                    );
                    setProcessing(false);
                },
            },
        );
    };

    return (
        <>
            <Head title={t('roles.create')} />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
            >
                <div className="flex min-w-0 items-center gap-4">
                    <Link href={roles.index()} className="shrink-0">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div className="min-w-0">
                        <Heading
                            title={t('roles.create')}
                            description={t('roles.create_desc')}
                        />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('roles.name')}</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setSlug(
                                            e.target.value
                                                .toLowerCase()
                                                .trim()
                                                .replace(/[^a-z0-9]+/g, '-')
                                                .replace(/(^-|-$)/g, ''),
                                        );
                                    }}
                                    placeholder={t('roles.name_placeholder')}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">{t('roles.slug')}</Label>
                                <Input
                                    id="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder={t('roles.slug_placeholder')}
                                    required
                                />
                                <InputError message={errors.slug} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="description">{t('roles.form_description')}</Label>
                                <Textarea
                                    id="description"
                                    rows={2}
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder={t('roles.description_placeholder')}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="mb-4 font-semibold">
                                {t('roles.route_permissions')}
                            </h3>
                            <RolePermissionsForm
                                groups={groups}
                                selected={selected}
                                onToggle={handleToggle}
                            />
                            <InputError message={errors.permissions} />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <FormActions
                            cancelHref={roles.index().url}
                            processing={processing}
                        />
                    </div>
                </form>
            </motion.div>
        </>
    );
}

RolesCreate.layout = {
    breadcrumbs: [
        {
            title: 'Roles',
            href: roles.index(),
        },
        {
            title: 'Create',
            href: roles.create(),
        },
    ],
};
