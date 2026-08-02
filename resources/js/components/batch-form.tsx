import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';

type Batch = {
    id?: number;
    name: string;
    subject: string | null;
    schedule: string | null;
    capacity: number;
    start_date: string | null;
    end_date: string | null;
    fees_amount: number;
    status: string;
};

type BatchFormProps = {
    batch?: Batch;
    onSubmit: (data: any) => void;
    processing: boolean;
    errors: Record<string, string>;
};

export default function BatchForm({ batch, onSubmit, processing, errors }: BatchFormProps) {
    const { data, setData } = useForm({
        name: batch?.name || '',
        subject: batch?.subject || '',
        schedule: batch?.schedule || '',
        capacity: batch?.capacity || 30,
        start_date: batch?.start_date || '',
        end_date: batch?.end_date || '',
        fees_amount: batch?.fees_amount || 0,
        status: batch?.status || 'active',
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
                        placeholder="Enter batch name"
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                        id="subject"
                        value={data.subject || ''}
                        onChange={(e) => setData('subject', e.target.value)}
                        placeholder="Enter subject"
                    />
                    <InputError message={errors.subject} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity *</Label>
                    <Input
                        id="capacity"
                        type="number"
                        value={data.capacity}
                        onChange={(e) => setData('capacity', parseInt(e.target.value) || 0)}
                        min="1"
                    />
                    <InputError message={errors.capacity} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fees_amount">Fees Amount *</Label>
                    <Input
                        id="fees_amount"
                        type="number"
                        step="0.01"
                        value={data.fees_amount}
                        onChange={(e) => setData('fees_amount', parseFloat(e.target.value) || 0)}
                        min="0"
                    />
                    <InputError message={errors.fees_amount} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                        id="start_date"
                        type="date"
                        value={data.start_date || ''}
                        onChange={(e) => setData('start_date', e.target.value)}
                    />
                    <InputError message={errors.start_date} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                        id="end_date"
                        type="date"
                        value={data.end_date || ''}
                        onChange={(e) => setData('end_date', e.target.value)}
                    />
                    <InputError message={errors.end_date} />
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
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.status} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="schedule">Schedule (JSON)</Label>
                <Input
                    id="schedule"
                    value={data.schedule || ''}
                    onChange={(e) => setData('schedule', e.target.value)}
                    placeholder='{"days": ["Mon", "Wed"], "time": "10:00-12:00"}'
                />
                <InputError message={errors.schedule} />
            </div>

            <div className="flex justify-end gap-2">
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : batch ? 'Update Batch' : 'Create Batch'}
                </Button>
            </div>
        </form>
    );
}
