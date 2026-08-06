import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';

type Batch = {
    id?: number;
    name: string;
    subject: string | null;
    days: string | null;
    time: string | null;
    capacity: number;
    start_date: string | null;
    end_date: string | null;
    status: string;
};

type BatchFormProps = {
    batch?: Batch;
    onSubmit: (data: any) => void;
    processing: boolean;
    errors: Record<string, string>;
};

const DAY_OPTIONS = [
    'Sat',
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Sat-Sun',
    'Sun-Tue',
    'Mon-Wed',
    'Tue-Thu',
    'Sat-Mon',
    'Sun-Wed',
    'Mon-Thu',
    'Sat-Thu',
    'Sat-Wed',
    'Sun-Thu',
];

export default function BatchForm({
    batch,
    onSubmit,
    processing,
    errors,
}: BatchFormProps) {
    const { data, setData } = useForm({
        name: batch?.name || '',
        subject: batch?.subject || '',
        days: batch?.days || '',
        time: batch?.time || '',
        capacity: batch?.capacity || 30,
        start_date: batch?.start_date || '',
        end_date: batch?.end_date || '',
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
                    <Label htmlFor="days">Days</Label>
                    <Select
                        value={data.days || ''}
                        onValueChange={(value) => setData('days', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select days" />
                        </SelectTrigger>
                        <SelectContent>
                            {DAY_OPTIONS.map((day) => (
                                <SelectItem key={day} value={day}>
                                    {day}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.days} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                        id="time"
                        value={data.time || ''}
                        onChange={(e) => setData('time', e.target.value)}
                        placeholder="e.g. 10:00 AM - 12:00 PM"
                    />
                    <InputError message={errors.time} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity *</Label>
                    <Input
                        id="capacity"
                        type="number"
                        value={data.capacity}
                        onChange={(e) =>
                            setData('capacity', parseInt(e.target.value) || 0)
                        }
                        min="1"
                    />
                    <InputError message={errors.capacity} />
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
                    <Select
                        value={data.status}
                        onValueChange={(value) => setData('status', value)}
                    >
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

            <div className="flex justify-end gap-2">
                <Button type="submit" disabled={processing}>
                    {processing
                        ? 'Saving...'
                        : batch
                          ? 'Update Batch'
                          : 'Create Batch'}
                </Button>
            </div>
        </form>
    );
}
