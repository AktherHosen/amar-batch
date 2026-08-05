import { useForm } from '@inertiajs/react';
import { type Student } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';

type CoachingClass = {
    id: number;
    name: string;
    default_fee: number;
};

type StudentFormProps = {
    student?: Student;
    coachingClasses: CoachingClass[];
    onSubmit: (data: any) => void;
    processing: boolean;
    errors: Record<string, string>;
};

export default function StudentForm({ student, coachingClasses, onSubmit, processing, errors }: StudentFormProps) {
    const { data, setData } = useForm({
        name: student?.name || '',
        phone: student?.phone || '',
        coaching_class_id: student?.coaching_class_id ? String(student.coaching_class_id) : '',
        section: student?.section || '',
        address: student?.address || '',
        date_of_birth: student?.date_of_birth ? student.date_of_birth.split('T')[0] : '',
        gender: student?.gender || '',
        guardian_name: student?.guardian_name || '',
        guardian_phone: student?.guardian_phone || '',
        status: student?.status || 'active',
        joined_at: student?.joined_at ? student.joined_at.split('T')[0] : '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Enter student name"
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        placeholder="Enter phone number"
                    />
                    <InputError message={errors.phone} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="coaching_class_id">Class</Label>
                    <Select
                        value={data.coaching_class_id}
                        onValueChange={(value) => setData('coaching_class_id', value)}
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

                <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Input
                        id="section"
                        value={data.section}
                        onChange={(e) => setData('section', e.target.value)}
                        placeholder="e.g. A, B"
                    />
                    <InputError message={errors.section} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="joined_at">Joined At</Label>
                    <Input
                        id="joined_at"
                        type="date"
                        value={data.joined_at}
                        onChange={(e) => setData('joined_at', e.target.value)}
                    />
                    <InputError message={errors.joined_at} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                        id="date_of_birth"
                        type="date"
                        value={data.date_of_birth}
                        onChange={(e) => setData('date_of_birth', e.target.value)}
                    />
                    <InputError message={errors.date_of_birth} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.gender} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={data.status} onValueChange={(value) => setData('status', value as 'active' | 'inactive')}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.status} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                    id="address"
                    value={data.address}
                    onChange={(e) => setData('address', e.target.value)}
                    placeholder="Enter address"
                />
                <InputError message={errors.address} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="guardian_name">Guardian Name</Label>
                    <Input
                        id="guardian_name"
                        value={data.guardian_name}
                        onChange={(e) => setData('guardian_name', e.target.value)}
                        placeholder="Enter guardian name"
                    />
                    <InputError message={errors.guardian_name} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="guardian_phone">Guardian Phone</Label>
                    <Input
                        id="guardian_phone"
                        value={data.guardian_phone}
                        onChange={(e) => setData('guardian_phone', e.target.value)}
                        placeholder="Enter guardian phone"
                    />
                    <InputError message={errors.guardian_phone} />
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : student ? 'Update Student' : 'Create Student'}
                </Button>
            </div>
        </form>
    );
}
