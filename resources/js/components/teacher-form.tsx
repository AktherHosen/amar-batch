import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { AvatarUpload } from '@/components/avatar-upload';
import { FormActions } from '@/components/form-actions';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useLocale } from '@/contexts/locale-context';
import { useHasFeature } from '@/lib/features';
import teachers from '@/routes/teachers';

type Role = {
    id: number;
    name: string;
    slug: string;
};

type Branch = {
    id: number;
    name: string;
};

type Teacher = {
    id?: number;
    name: string;
    email: string;
    role?: string;
    branch_id?: number | null;
    avatar?: string | null;
};

type TeacherFormProps = {
    teacher?: Teacher;
    roles?: Role[];
    branches?: Branch[];
    onSubmit: (data: FormData) => void;
    processing: boolean;
    errors: Record<string, string>;
};

export default function TeacherForm({
    teacher,
    roles = [],
    branches = [],
    onSubmit,
    processing,
    errors,
}: TeacherFormProps) {
    const { t } = useLocale();
    const hasMultiBranch = useHasFeature('multi_branch');
    const { data, setData } = useForm({
        name: teacher?.name || '',
        email: teacher?.email || '',
        password: '',
        password_confirmation: '',
        role:
            teacher?.role && teacher.role !== 'inactive'
                ? teacher.role
                : 'teacher',
        branch_id: teacher?.branch_id ? String(teacher.branch_id) : '',
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
                value={teacher?.avatar ?? null}
                onChange={(file) => setAvatarFile(file)}
                label={t('teachers.avatar')}
                hint={t('teachers.avatar_hint')}
                error={errors.avatar}
            />
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">{t('teachers.name')} *</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder={t('teachers.name_placeholder')}
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">{t('teachers.email')} *</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder={t('teachers.email_placeholder')}
                    />
                    <InputError message={errors.email} />
                </div>

                {roles.length > 0 && (
                    <div className="space-y-2">
                        <Label htmlFor="role">{t('teachers.role')} *</Label>
                        <Select
                            value={data.role}
                            onValueChange={(value) => setData('role', value)}
                        >
                            <SelectTrigger id="role" className="w-full">
                                <SelectValue
                                    placeholder={t('teachers.select_role')}
                                />
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

                {hasMultiBranch && branches.length > 0 && (
                    <div className="space-y-2">
                        <Label htmlFor="branch_id">Branch</Label>
                        <Select
                            value={data.branch_id || 'all'}
                            onValueChange={(value) =>
                                setData(
                                    'branch_id',
                                    value === 'all' ? '' : value,
                                )
                            }
                        >
                            <SelectTrigger id="branch_id" className="w-full">
                                <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All branches
                                </SelectItem>
                                {branches.map((branch) => (
                                    <SelectItem
                                        key={branch.id}
                                        value={String(branch.id)}
                                    >
                                        {branch.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.branch_id} />
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="password">
                        {t('teachers.password')}{' '}
                        {teacher ? `(${t('teachers.password_hint')})` : '*'}
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder={t('teachers.password_placeholder')}
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">
                        {t('teachers.confirm_password')} {teacher ? '' : '*'}
                    </Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        placeholder={t('teachers.confirm_password_placeholder')}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <FormActions
                    cancelHref={teachers.index().url}
                    processing={processing}
                />
            </div>
        </form>
    );
}
