import { useForm } from '@inertiajs/react';
import { type Student } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';

type StudentFormProps = {
    student?: Student;
    onSubmit: (data: any) => void;
    processing: boolean;
    errors: Record<string, string>;
};

export default function StudentForm({ student, onSubmit, processing, errors }: StudentFormProps) {
    const { data, setData } = useForm({
        name: student?.name || '',
        email: student?.email || '',
        phone: student?.phone || '',
        class_name: student?.class_name || '',
        section: student?.section || '',
        address: student?.address || '',
        date_of_birth: student?.date_of_birth || '',
        gender: student?.gender || '',
        guardian_name: student?.guardian_name || '',
        guardian_phone: student?.guardian_phone || '',
        status: student?.status || 'active',
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
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="Enter email address"
                    />
                    <InputError message={errors.email} />
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
                    <Label htmlFor="class_name">Class / Grade</Label>
                    <Input
                        id="class_name"
                        value={data.class_name}
                        onChange={(e) => setData('class_name', e.target.value)}
                        placeholder="e.g. Class 10, B.Tech 2nd Year"
                    />
                    <InputError message={errors.class_name} />
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
                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
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
