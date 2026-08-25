import { useForm } from '@inertiajs/react';
import { Camera, Lock, Shield, User, X } from 'lucide-react';
import { useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { FormActions } from '@/components/form-actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
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
    onCancel?: () => void;
    processing: boolean;
    errors: Record<string, string>;
    submitLabel?: string;
    hideActions?: boolean;
};

function SectionHeader({
    icon: Icon,
    title,
}: {
    icon: React.ElementType;
    title: string;
}) {
    return (
        <div className="flex items-center gap-2 border-b pb-2">
            <Icon className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">
                {title}
            </h3>
        </div>
    );
}

export default function TeacherForm({
    teacher,
    roles = [],
    branches = [],
    onSubmit,
    onCancel,
    processing,
    errors,
    submitLabel,
    hideActions,
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
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        teacher?.avatar ? `/storage/${teacher.avatar}` : null,
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const removeAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

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
        <form id="teacher-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex size-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/25 bg-muted transition-colors hover:border-muted-foreground/50"
                    >
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="Teacher avatar"
                                className="size-full object-cover"
                            />
                        ) : (
                            <Camera className="size-8 text-muted-foreground/50" />
                        )}
                    </button>
                    {avatarPreview && (
                        <button
                            type="button"
                            onClick={removeAvatar}
                            className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground"
                        >
                            <X className="size-3" />
                        </button>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                    />
                </div>
                <div className="space-y-2 text-center">
                    <Label>{t('teachers.avatar')}</Label>
                    <p className="text-xs text-muted-foreground">
                        {t('teachers.avatar_hint')}
                    </p>
                    <InputError message={errors.avatar} />
                </div>
            </div>

            <div className="space-y-4">
                <SectionHeader icon={User} title={t('teachers.account_info')} />
                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>
            </div>

            <div className="space-y-4">
                <SectionHeader icon={Shield} title={t('teachers.access')} />
                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>
            </div>

            <div className="space-y-4">
                <SectionHeader icon={Lock} title={t('teachers.security')} />
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="password">
                            {t('teachers.password')}{' '}
                            {teacher ? `(${t('teachers.password_hint')})` : '*'}
                        </Label>
                        <PasswordInput
                            id="password"
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
                        <PasswordInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            placeholder={t('teachers.confirm_password_placeholder')}
                        />
                    </div>
                </div>
            </div>

            {!hideActions && (
                <div className="flex justify-end gap-2 border-t pt-4">
                    <FormActions
                        cancelHref={onCancel ? undefined : teachers.index().url}
                        onCancel={onCancel}
                        processing={processing}
                        submitLabel={submitLabel}
                    />
                </div>
            )}
        </form>
    );
}
