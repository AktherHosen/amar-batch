import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/contexts/locale-context';
import attendance from '@/routes/attendance';

type AttendanceRecord = {
    id: number;
    student: { id: number; name: string };
    batch: { id: number; name: string };
    date: string;
    status: 'present' | 'absent' | 'late';
    notes: string | null;
};

type PageProps = {
    attendance: AttendanceRecord;
};

export default function AttendanceEdit({ attendance: record }: PageProps) {
    const { t } = useLocale();
    const [status, setStatus] = useState<'present' | 'absent' | 'late'>(record.status);
    const [notes, setNotes] = useState(record.notes || '');

    const handleSubmit = () => {
        router.put(attendance.update(record.id), {
            status,
            notes: notes || null,
        });
    };

    return (
        <>
            <Head title="Edit Attendance" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    title="Edit Attendance"
                    description={`${record.student.name} - ${record.batch.name} - ${new Date(record.date).toLocaleDateString()}`}
                />

                <Card>
                    <CardHeader>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Student</p>
                                <p className="font-medium">{record.student.name}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Batch</p>
                                <p className="font-medium">{record.batch.name}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Date</p>
                                <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={status === 'present' ? 'default' : 'outline'}
                                    onClick={() => setStatus('present')}
                                >
                                    Present
                                </Button>
                                <Button
                                    size="sm"
                                    variant={status === 'absent' ? 'destructive' : 'outline'}
                                    onClick={() => setStatus('absent')}
                                >
                                    Absent
                                </Button>
                                <Button
                                    size="sm"
                                    variant={status === 'late' ? 'secondary' : 'outline'}
                                    onClick={() => setStatus('late')}
                                >
                                    Late
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Input
                                placeholder="Optional notes..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => window.history.back()}>
                                {t('actions.cancel')}
                            </Button>
                            <Button onClick={handleSubmit}>{t('actions.update')}</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AttendanceEdit.layout = {
    breadcrumbs: [
        {
            title: 'Attendance',
            href: attendance.index(),
        },
        {
            title: 'Edit',
            href: '#',
        },
    ],
};
