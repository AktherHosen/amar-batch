import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';

type Student = {
    id: number;
    name: string;
};

type Batch = {
    id: number;
    name: string;
};

type FeeStatus = {
    id?: number;
    student_id: number;
    batch_id: number;
    amount_paid: number;
    amount_due: number;
    due_date: string | null;
    status: 'paid' | 'partial' | 'unpaid';
    payment_date: string | null;
    notes: string | null;
};

type FeeFormProps = {
    fee?: FeeStatus;
    students: Student[];
    batches: Batch[];
    isEdit?: boolean;
};

export default function FeeForm({ fee, students, batches, isEdit = false }: FeeFormProps) {
    const { data, setData, post, put, processing, errors } = useForm<FeeStatus>({
        student_id: fee?.student_id || 0,
        batch_id: fee?.batch_id || 0,
        amount_paid: fee?.amount_paid || 0,
        amount_due: fee?.amount_due || 0,
        due_date: fee?.due_date ? new Date(fee.due_date).toISOString().split('T')[0] : '',
        status: fee?.status || 'unpaid',
        payment_date: fee?.payment_date ? new Date(fee.payment_date).toISOString().split('T')[0] : '',
        notes: fee?.notes || '',
    });

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
                    <Label htmlFor="student_id">Student</Label>
                    <Select value={data.student_id ? data.student_id.toString() : ''} onValueChange={(v) => setData('student_id', parseInt(v))}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                        <SelectContent>
                            {students.map((student) => (
                                <SelectItem key={student.id} value={student.id.toString()}>
                                    {student.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.student_id} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="batch_id">Batch</Label>
                    <Select value={data.batch_id ? data.batch_id.toString() : ''} onValueChange={(v) => setData('batch_id', parseInt(v))}>
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
                    <Label htmlFor="amount_paid">Amount Paid</Label>
                    <Input
                        id="amount_paid"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.amount_paid}
                        onChange={(e) => setData('amount_paid', parseFloat(e.target.value) || 0)}
                    />
                    <InputError message={errors.amount_paid} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="amount_due">Amount Due</Label>
                    <Input
                        id="amount_due"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.amount_due}
                        onChange={(e) => setData('amount_due', parseFloat(e.target.value) || 0)}
                    />
                    <InputError message={errors.amount_due} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={data.status} onValueChange={(v: 'paid' | 'partial' | 'unpaid') => setData('status', v)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="partial">Partial</SelectItem>
                            <SelectItem value="unpaid">Unpaid</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.status} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                        id="due_date"
                        type="date"
                        value={data.due_date || ''}
                        onChange={(e) => setData('due_date', e.target.value || null)}
                    />
                    <InputError message={errors.due_date} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="payment_date">Payment Date</Label>
                    <Input
                        id="payment_date"
                        type="date"
                        value={data.payment_date || ''}
                        onChange={(e) => setData('payment_date', e.target.value || null)}
                    />
                    <InputError message={errors.payment_date} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                    id="notes"
                    value={data.notes || ''}
                    onChange={(e) => setData('notes', e.target.value || null)}
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
