import { useForm } from '@inertiajs/react';
import type { Student } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import { Camera, X, User, Phone, BookOpen, Calendar, Shield, MapPin } from 'lucide-react';
import { useRef, useState } from 'react';
import { useLocale } from '@/contexts/locale-context';

type CoachingClass = {
    id: number;
    name: string;
    default_fee: number;
};

type StudentFormProps = {
    student?: Student;
    coachingClasses: CoachingClass[];
    onSubmit: (data: FormData) => void;
    processing: boolean;
    errors: Record<string, string>;
};

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
    return (
        <div className="flex items-center gap-2 pb-2 border-b">
            <Icon className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        </div>
    );
}

export default function StudentForm({
    student,
    coachingClasses,
    onSubmit,
    processing,
    errors,
}: StudentFormProps) {
    const { t } = useLocale();
    const { data, setData } = useForm({
        name: student?.name || '',
        phone: student?.phone || '',
        coaching_class_id: student?.coaching_class_id
            ? String(student.coaching_class_id)
            : '',
        section: student?.section || '',
        address: student?.address || '',
        date_of_birth: student?.date_of_birth
            ? student.date_of_birth.split('T')[0]
            : '',
        gender: student?.gender || '',
        guardian_name: student?.guardian_name || '',
        guardian_phone: student?.guardian_phone || '',
        status: student?.status || 'active',
        joined_at: student?.joined_at ? student.joined_at.split('T')[0] : '',
        left_at: student?.left_at ? student.left_at.split('T')[0] : '',
    });

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(
        student?.photo ? `/storage/${student.photo}` : null,
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setData('photo', null as any);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                formData.append(key, String(value));
            }
        });
        if (photoFile) {
            formData.append('photo', photoFile);
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex size-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/25 bg-muted transition-colors hover:border-muted-foreground/50"
                    >
                        {photoPreview ? (
                            <img
                                src={photoPreview}
                                alt="Student photo"
                                className="size-full object-cover"
                            />
                        ) : (
                            <Camera className="size-8 text-muted-foreground/50" />
                        )}
                    </button>
                    {photoPreview && (
                        <button
                            type="button"
                            onClick={removePhoto}
                            className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground"
                        >
                            <X className="size-3" />
                        </button>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                    />
                </div>
                <div className="space-y-2 text-center">
                    <Label>{t('students.photo')}</Label>
                    <p className="text-xs text-muted-foreground">
                        {t('students.photo_hint')}
                    </p>
                    <InputError message={errors.photo} />
                </div>
            </div>

            <div className="space-y-4">
                <SectionHeader icon={User} title={t('students.personal_info')} />
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t('students.name')} *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter student name"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">{t('students.phone')}</Label>
                        <Input
                            id="phone"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="Enter phone number"
                        />
                        <InputError message={errors.phone} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date_of_birth">{t('students.date_of_birth')}</Label>
                        <Input
                            id="date_of_birth"
                            type="date"
                            lang="en-GB"
                            value={data.date_of_birth}
                            onChange={(e) =>
                                setData('date_of_birth', e.target.value)
                            }
                        />
                        <InputError message={errors.date_of_birth} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gender">{t('students.gender')}</Label>
                        <Select
                            value={data.gender}
                            onValueChange={(value) => setData('gender', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">{t('students.male')}</SelectItem>
                                <SelectItem value="female">{t('students.female')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.gender} />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <SectionHeader icon={BookOpen} title={t('students.academic_info')} />
                <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="coaching_class_id">{t('students.class')}</Label>
                        <Select
                            value={data.coaching_class_id}
                            onValueChange={(value) =>
                                setData('coaching_class_id', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent>
                                {coachingClasses.map((cls) => (
                                    <SelectItem key={cls.id} value={String(cls.id)}>
                                        {cls.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.coaching_class_id} />
                    </div>

                    <div className="flex-1 space-y-2">
                        <Label htmlFor="section">{t('students.section')}</Label>
                        <Input
                            id="section"
                            value={data.section}
                            onChange={(e) => setData('section', e.target.value)}
                            placeholder="e.g. A, B"
                        />
                        <InputError message={errors.section} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">{t('students.status')}</Label>
                    <Select
                        value={data.status}
                        onValueChange={(value) =>
                            setData('status', value as 'active' | 'inactive')
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">{t('students.active')}</SelectItem>
                            <SelectItem value="inactive">{t('students.inactive')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.status} />
                </div>
            </div>

            <div className="space-y-4">
                <SectionHeader icon={Calendar} title={t('students.dates')} />
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="joined_at">{t('students.joined_at')}</Label>
                        <Input
                            id="joined_at"
                            type="date"
                            lang="en-GB"
                            value={data.joined_at}
                            onChange={(e) => setData('joined_at', e.target.value)}
                        />
                        <InputError message={errors.joined_at} />
                    </div>

                    {student && (
                        <div className="space-y-2">
                            <Label htmlFor="left_at">{t('students.left_at')}</Label>
                            <Input
                                id="left_at"
                                type="date"
                                lang="en-GB"
                                value={data.left_at}
                                onChange={(e) => setData('left_at', e.target.value)}
                            />
                            <InputError message={errors.left_at} />
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <SectionHeader icon={MapPin} title={t('students.address')} />
                <div className="space-y-2">
                    <Textarea
                        id="address"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        placeholder="Enter address"
                        rows={3}
                    />
                    <InputError message={errors.address} />
                </div>
            </div>

            <div className="space-y-4">
                <SectionHeader icon={Shield} title={t('students.guardian_info')} />
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="guardian_name">{t('students.guardian_name')}</Label>
                        <Input
                            id="guardian_name"
                            value={data.guardian_name}
                            onChange={(e) =>
                                setData('guardian_name', e.target.value)
                            }
                            placeholder="Enter guardian name"
                        />
                        <InputError message={errors.guardian_name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="guardian_phone">{t('students.guardian_phone')}</Label>
                        <Input
                            id="guardian_phone"
                            value={data.guardian_phone}
                            onChange={(e) =>
                                setData('guardian_phone', e.target.value)
                            }
                            placeholder="Enter guardian phone"
                        />
                        <InputError message={errors.guardian_phone} />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="submit" disabled={processing}>
                    {processing
                        ? t('actions.save') + '...'
                        : student
                          ? t('students.update')
                          : t('students.create')}
                </Button>
            </div>
        </form>
    );
}
