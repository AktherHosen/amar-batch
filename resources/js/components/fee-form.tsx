import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';

type Student = {
    id: number;
    name: string;
    coaching_class: { id: number; name: string } | null;
};

type Batch = {
    id: number;
    name: string;
};

type Enrollment = {
    student: Student;
    batch: Batch;
    enrolled_at: string | null;
};

type FeeFormData = {
    student_id: string;
    batch_id: string;
    month: string;
    year: string;
    amount_paid: string;
    notes: string;
};

type FeeStatus = {
    id?: number;
    student_id: number;
    batch_id: number;
    month: number;
    year: number;
    amount_paid: number;
    notes: string | null;
};

type FeeFormProps = {
    fee?: FeeStatus;
    students: Student[];
    batches: Batch[];
    enrollments: Enrollment[];
    isEdit?: boolean;
};

const MONTH_NAMES = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export default function FeeForm({ fee, students, batches, enrollments, isEdit = false }: FeeFormProps) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const getDefaultMonth = () => {
        if (fee?.month) {
return fee.month.toString();
}

        return currentMonth.toString();
    };

    const getDefaultYear = () => {
        if (fee?.year) {
return fee.year.toString();
}

        return currentYear.toString();
    };

    const { data, setData, post, put, processing, errors } = useForm<FeeFormData>({
        student_id: fee?.student_id?.toString() || '',
        batch_id: fee?.batch_id?.toString() || '',
        month: getDefaultMonth(),
        year: getDefaultYear(),
        amount_paid: fee?.amount_paid?.toString() || '',
        notes: fee?.notes || '',
    });

    const getEnrollmentForStudent = (studentId: string) => {
        return enrollments.find((e) => e.student.id.toString() === studentId);
    };

    const handleStudentChange = (v: string) => {
        setData('student_id', v);
        const enrollment = getEnrollmentForStudent(v);

        if (enrollment) {
            setData('batch_id', enrollment.batch.id.toString());

            if (enrollment.enrolled_at) {
                const enrollDate = new Date(enrollment.enrolled_at);
                setData('month', (enrollDate.getMonth() + 1).toString());
                setData('year', enrollDate.getFullYear().toString());
            }
        } else {
            setData('batch_id', '');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && fee?.id) {
            put(`/fees/${fee.id}`);
        } else {
            post('/fees');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="student_id">Student *</Label>
                    <Select value={data.student_id} onValueChange={handleStudentChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                        <SelectContent>
                            {students.map((student) => (
                                <SelectItem key={student.id} value={student.id.toString()}>
                                    {student.name}{student.coaching_class ? ` (${student.coaching_class.name})` : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.student_id} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="batch_id">Batch *</Label>
                    <Select value={data.batch_id} onValueChange={(v) => setData('batch_id', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a batch" />
                        </SelectTrigger>
                        <SelectContent>
                            {batches.map((batch) => (
                                <SelectItem key={batch.id} value={batch.id.toString()}>
                                    {batch.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.batch_id} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="month">Month *</Label>
                    <Select value={data.month} onValueChange={(v) => setData('month', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                            {MONTH_NAMES.slice(1).map((name, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                    {name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.month} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input
                        id="year"
                        type="number"
                        min="2020"
                        max="2100"
                        value={data.year}
                        onChange={(e) => setData('year', e.target.value)}
                    />
                    <InputError message={errors.year} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="amount_paid">Amount Paid *</Label>
                    <Input
                        id="amount_paid"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.amount_paid}
                        onChange={(e) => setData('amount_paid', e.target.value)}
                        placeholder="Enter amount"
                    />
                    <InputError message={errors.amount_paid} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                    id="notes"
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    placeholder="Optional notes..."
                />
                <InputError message={errors.notes} />
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {isEdit ? 'Update' : 'Create'}
                </Button>
            </div>
        </form>
    );
}
