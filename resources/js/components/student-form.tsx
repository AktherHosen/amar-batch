import { router, useForm } from '@inertiajs/react';
import {
    Camera,
    X,
    User,
    Phone,
    BookOpen,
    Calendar,
    Shield,
    MapPin,
    Plus,
    Loader2,
    LogIn,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FormActions } from '@/components/form-actions';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/contexts/locale-context';
import students from '@/routes/students';
import type { Student } from '@/types';

type CoachingClass = {
    id: number;
    name: string;
    default_fee: number;
};

type StudentFormProps = {
    student?: Student;
    coachingClasses: CoachingClass[];
    existingParents?: Array<{ id: number; name: string; email: string }>;
    onSubmit: (data: FormData) => void;
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

export default function StudentForm({
    student,
    coachingClasses,
    existingParents = [],
    onSubmit,
    processing,
    errors,
    submitLabel,
    hideActions,
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
        create_parent_login: false,
        parent_email: '',
        parent_password: '',
        link_parent_id: '',
    });

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(
        student?.photo ? `/storage/${student.photo}` : null,
    );
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [classModalOpen, setClassModalOpen] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [newClassFee, setNewClassFee] = useState('');
    const [classCreating, setClassCreating] = useState(false);
    const [classErrors, setClassErrors] = useState<Record<string, string>>({});
    const [classes, setClasses] = useState(coachingClasses);

    useEffect(() => {
        setClasses(coachingClasses);
    }, [coachingClasses]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Photo must be less than 2MB');

                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }

                return;
            }

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
                formData.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value));
            }
        });

        if (photoFile) {
            formData.append('photo', photoFile);
        }

        onSubmit(formData);
    };

    const handleCreateClass = async (e?: React.SyntheticEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        setClassCreating(true);
        setClassErrors({});

        try {
            const xsrfToken = decodeURIComponent(
                document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
            );

            const response = await fetch('/coaching-classes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken,
                },
                body: JSON.stringify({
                    name: newClassName,
                    default_fee: newClassFee ? Number(newClassFee) : '',
                }),
            });

            const resData = await response.json();

            if (!response.ok) {
                if (response.status === 422 && resData.errors) {
                    const formattedErrors: Record<string, string> = {};
                    Object.entries(resData.errors).forEach(([k, msgs]: [string, any]) => {
                        formattedErrors[k] = Array.isArray(msgs)
                            ? msgs[0]
                            : String(msgs);
                    });
                    setClassErrors(formattedErrors);
                } else {
                    toast.error(resData.message || 'Failed to create class.');
                }

                return;
            }

            const createdClass = resData.class || resData;
            setClasses((prev) => [...prev, createdClass]);
            setData('coaching_class_id', String(createdClass.id));
            setNewClassName('');
            setNewClassFee('');
            setClassModalOpen(false);
            toast.success(resData.message || 'Class created successfully.');
            router.reload({ only: ['coachingClasses'] });
        } catch (err: any) {
            toast.error(err?.message || 'An error occurred while creating class.');
        } finally {
            setClassCreating(false);
        }
    };

    return (
        <form id="student-form" onSubmit={handleSubmit} className="space-y-6">
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
                <SectionHeader
                    icon={User}
                    title={t('students.personal_info')}
                />
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
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="Enter phone number"
                        />
                        <InputError message={errors.phone} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date_of_birth">
                            {t('students.date_of_birth')}
                        </Label>
                        <DatePicker
                            value={data.date_of_birth}
                            onValueChange={(value) =>
                                setData('date_of_birth', value)
                            }
                            placeholder="Select date of birth"
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
                                <SelectItem value="male">
                                    {t('students.male')}
                                </SelectItem>
                                <SelectItem value="female">
                                    {t('students.female')}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.gender} />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <SectionHeader
                    icon={BookOpen}
                    title={t('students.academic_info')}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="coaching_class_id">
                            {t('students.class')} *
                        </Label>
                        <div className="flex gap-1.5 items-center">
                            <SearchableSelect
                                options={classes.map((cls) => ({
                                    value: String(cls.id),
                                    label: cls.name,
                                    description: cls.default_fee
                                        ? `Default Fee: ৳${cls.default_fee}`
                                        : undefined,
                                    searchText: cls.name,
                                }))}
                                value={data.coaching_class_id}
                                onValueChange={(value) =>
                                    setData('coaching_class_id', value)
                                }
                                placeholder={t('students.class') || 'Select class'}
                                emptyText="No classes available"
                                noResultsText="No classes found"
                                className="w-full flex-1"
                            />
                            <Dialog
                                open={classModalOpen}
                                onOpenChange={setClassModalOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="size-9 shrink-0"
                                    >
                                        <Plus className="size-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Add Coaching Class
                                        </DialogTitle>
                                        <DialogDescription>
                                            Quickly add a new class without
                                            leaving this form.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleCreateClass(e);
                                            }
                                        }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <Label htmlFor="new_class_name">
                                                Name *
                                            </Label>
                                            <Input
                                                id="new_class_name"
                                                value={newClassName}
                                                onChange={(e) =>
                                                    setNewClassName(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. Nursery, KG, Class 1"
                                            />
                                            <InputError
                                                message={classErrors.name}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new_class_fee">
                                                Default Fee *
                                            </Label>
                                            <Input
                                                id="new_class_fee"
                                                type="number"
                                                value={newClassFee}
                                                onChange={(e) =>
                                                    setNewClassFee(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. 500"
                                                min="0"
                                            />
                                            <InputError
                                                message={
                                                    classErrors.default_fee
                                                }
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    setClassModalOpen(false)
                                                }
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={handleCreateClass}
                                                disabled={classCreating}
                                            >
                                                {classCreating && (
                                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                                )}
                                                Create
                                            </Button>
                                        </DialogFooter>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <InputError message={errors.coaching_class_id} />
                    </div>

                    <div className="space-y-2">
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

            </div>

            <div className="space-y-4">
                <SectionHeader icon={Calendar} title={t('students.dates')} />
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="joined_at">
                            {t('students.joined_at')}
                        </Label>
                        <DatePicker
                            value={data.joined_at}
                            onValueChange={(value) =>
                                setData('joined_at', value)
                            }
                            placeholder={t('students.joined_at')}
                        />
                        <InputError message={errors.joined_at} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">{t('students.status')}</Label>
                        <Select
                            value={data.status}
                            onValueChange={(value) =>
                                setData(
                                    'status',
                                    value as 'active' | 'inactive' | 'paused',
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">
                                    {t('students.active')}
                                </SelectItem>
                                <SelectItem value="paused">
                                    {t('students.paused')}
                                </SelectItem>
                                <SelectItem value="inactive">
                                    {t('students.inactive')}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.status} />
                    </div>

                    {student && (
                        <div className="space-y-2">
                            <Label htmlFor="left_at">
                                {t('students.left_at')}
                            </Label>
                            <DatePicker
                                value={data.left_at}
                                onValueChange={(value) =>
                                    setData('left_at', value)
                                }
                                placeholder={t('students.left_at')}
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
                <SectionHeader
                    icon={Shield}
                    title={t('students.guardian_info')}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="guardian_name">
                            {t('students.guardian_name')}
                        </Label>
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
                        <Label htmlFor="guardian_phone">
                            {t('students.guardian_phone')}
                        </Label>
                        <Input
                            id="guardian_phone"
                            type="tel"
                            value={data.guardian_phone}
                            onChange={(e) =>
                                setData('guardian_phone', e.target.value)
                            }
                            placeholder="Enter guardian phone"
                        />
                        <InputError message={errors.guardian_phone} />
                    </div>
                </div>

                {(student?.parents_count ?? 0) === 0 ? (
                    <div className="rounded-lg border p-3 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                                <LogIn className="size-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Parent Account</p>
                                <p className="text-xs text-muted-foreground">
                                    Link an existing parent or create a new login
                                </p>
                            </div>
                        </div>

                        {existingParents.length > 0 && (
                            <div className="space-y-2">
                                <Label htmlFor="link_parent_id">Link Existing Parent</Label>
                                <Select
                                    value={data.link_parent_id}
                                    onValueChange={(v) => {
                                        setData('link_parent_id', v);
                                        if (v) {
                                            setData('create_parent_login', false);
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an existing parent" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {existingParents.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)}>
                                                {p.name} ({p.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Or create a new parent login below
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={data.create_parent_login}
                                    onCheckedChange={(checked) => {
                                        setData('create_parent_login', checked);
                                        if (checked) {
                                            setData('link_parent_id', '');
                                        }
                                    }}
                                />
                                <span className="text-sm">Create New Parent Login</span>
                            </div>
                        </div>

                        {data.create_parent_login && (
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="parent_email">Parent Email *</Label>
                                    <Input
                                        id="parent_email"
                                        type="email"
                                        value={data.parent_email}
                                        onChange={(e) => setData('parent_email', e.target.value)}
                                        placeholder="parent@example.com"
                                    />
                                    <InputError message={errors.parent_email} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="parent_password">Password *</Label>
                                    <Input
                                        id="parent_password"
                                        type="password"
                                        value={data.parent_password}
                                        onChange={(e) => setData('parent_password', e.target.value)}
                                        placeholder="Min 6 characters"
                                    />
                                    <InputError message={errors.parent_password} />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="rounded-lg border p-3 space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-green-500/10">
                                <LogIn className="size-4 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Parent Account Linked</p>
                                <p className="text-xs text-muted-foreground">
                                    {student?.parents?.map((p) => p.email).join(', ') || 'Parent login is active'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {!hideActions && (
                <div className="flex justify-end gap-2 border-t pt-4">
                    <FormActions
                        cancelHref={students.index().url}
                        processing={processing}
                        submitLabel={submitLabel}
                    />
                </div>
            )}
        </form>
    );
}
