import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { useLocale } from '@/contexts/locale-context';

type Teacher = {
    id?: number;
    name: string;
    email: string;
};

type TeacherFormProps = {
    teacher?: Teacher;
    onSubmit: (data: any) => void;
    processing: boolean;
    errors: Record<string, string>;
};

export default function TeacherForm({
    teacher,
    onSubmit,
    processing,
    errors,
}: TeacherFormProps) {
    const { t } = useLocale();
    const { data, setData } = useForm({
        name: teacher?.name || '',
        email: teacher?.email || '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
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
                <Button type="submit" disabled={processing}>
                    {processing
                        ? t('teachers.saving')
                        : teacher
                          ? t('teachers.update')
                          : t('teachers.create')}
                </Button>
            </div>
        </form>
    );
}
