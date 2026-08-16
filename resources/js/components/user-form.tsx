import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AvatarUpload } from '@/components/avatar-upload';
import { useState } from 'react';
import { useLocale } from '@/contexts/locale-context';

type Role = {
    id: number;
    name: string;
    slug: string;
};

type User = {
    id?: number;
    name: string;
    email: string;
    role?: string;
    avatar?: string | null;
};

type UserFormProps = {
    user?: User;
    roles?: Role[];
    onSubmit: (data: FormData) => void;
    processing: boolean;
    errors: Record<string, string>;
};

export default function UserForm({
    user,
    roles = [],
    onSubmit,
    processing,
    errors,
}: UserFormProps) {
    const { t } = useLocale();
    const { data, setData } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        password_confirmation: '',
        role: user?.role && user.role !== 'inactive' ? user.role : 'staff',
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                formData.append(key, String(value));
            }
        });
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <AvatarUpload
                value={user?.avatar ?? null}
                onChange={(file) => setAvatarFile(file)}
                label={t('users.avatar')}
                hint={t('users.avatar_hint')}
                error={errors.avatar}
            />
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">{t('users.name')} *</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder={t('users.name_placeholder')}
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">{t('users.email')} *</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder={t('users.email_placeholder')}
                    />
                    <InputError message={errors.email} />
                </div>

                {roles.length > 0 && (
                    <div className="space-y-2">
                        <Label htmlFor="role">{t('users.role')} *</Label>
                        <Select
                            value={data.role}
                            onValueChange={(value) => setData('role', value)}
                        >
                            <SelectTrigger id="role" className="w-full">
                                <SelectValue placeholder={t('users.select_role')} />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.slug}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.role} />
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="password">
                        {t('users.password')}{' '}
                        {user ? `(${t('users.password_hint')})` : '*'}
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder={t('users.password_placeholder')}
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">
                        {t('users.confirm_password')} {user ? '' : '*'}
                    </Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        placeholder={t('users.confirm_password_placeholder')}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button type="submit" disabled={processing}>
                    {processing
                        ? t('users.saving')
                        : user
                          ? t('users.update')
                          : t('users.create')}
                </Button>
            </div>
        </form>
    );
}