import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { FormActions } from '@/components/form-actions';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/contexts/locale-context';

type Student = { id: number; name: string };
type Batch = { id: number; name: string };
type Enrollment = { student_id: number; batch_id: number };

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

export default function FeeReceiptCreate() {
    const { students, batches, enrollments } = usePage<{ students: Student[]; batches: Batch[]; enrollments: Enrollment[] }>().props;
    const { t } = useLocale();
    const [data, setData] = useState({
        student_id: '',
        batch_id: '',
        month: String(currentMonth),
        year: String(currentYear),
        amount_paid: '',
        amount_due: '',
        notes: '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const filteredBatches = useMemo(() => {
        if (!data.student_id) return batches;
        const enrolledBatchIds = enrollments
            .filter((e) => e.student_id === Number(data.student_id))
            .map((e) => e.batch_id);
        return batches.filter((b) => enrolledBatchIds.includes(b.id));
    }, [data.student_id, batches, enrollments]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.post('/fees/receipts', {
            ...data,
            month: Number(data.month),
            year: Number(data.year),
            amount_paid: Number(data.amount_paid),
            amount_due: Number(data.amount_due),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('toast.receipt_generated'));
                router.get('/fees/receipts');
            },
            onError: (err) => {
                setErrors(err as Record<string, string>);
                setProcessing(false);
            },
        });
    };

    return (
        <>
            <Head title={t('receipts.create_title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href="/fees/receipts">
                        <Button variant="ghost" size="icon" className="size-9">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div className="min-w-0">
                        <h2 className="truncate text-xl font-semibold tracking-tight">
                            {t('receipts.create_title')}
                        </h2>
                    </div>
                </div>

                <Card className="max-w-xl mx-auto">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label>{t('receipts.label_student')} *</Label>
                                <Select value={data.student_id} onValueChange={(v) => setData({ ...data, student_id: v, batch_id: '' })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('receipts.select_student')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.student_id} />
                            </div>

                            <div className="space-y-2">
                                <Label>{t('receipts.label_batch')} *</Label>
                                <Select value={data.batch_id} onValueChange={(v) => setData({ ...data, batch_id: v })} disabled={!data.student_id}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={data.student_id ? t('receipts.select_batch') : t('receipts.select_student_first')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredBatches.map((b) => (
                                            <SelectItem key={b.id} value={String(b.id)}>
                                                {b.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.batch_id} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>{t('receipts.label_month')} *</Label>
                                    <Select value={data.month} onValueChange={(v) => setData({ ...data, month: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MONTHS.map((m, i) => (
                                                <SelectItem key={i + 1} value={String(i + 1)}>
                                                    {m}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.month} />
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('receipts.label_year')} *</Label>
                                    <Input
                                        type="number"
                                        value={data.year}
                                        onChange={(e) => setData({ ...data, year: e.target.value })}
                                        min="2020"
                                        max="2100"
                                    />
                                    <InputError message={errors.year} />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>{t('receipts.label_amount_paid')} *</Label>
                                    <Input
                                        type="number"
                                        value={data.amount_paid}
                                        onChange={(e) => setData({ ...data, amount_paid: e.target.value })}
                                        placeholder="0"
                                        min="0"
                                    />
                                    <InputError message={errors.amount_paid} />
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('receipts.label_amount_due')} *</Label>
                                    <Input
                                        type="number"
                                        value={data.amount_due}
                                        onChange={(e) => setData({ ...data, amount_due: e.target.value })}
                                        placeholder="0"
                                        min="0"
                                    />
                                    <InputError message={errors.amount_due} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>{t('receipts.label_notes')}</Label>
                                <Textarea
                                    value={data.notes}
                                    onChange={(e) => setData({ ...data, notes: e.target.value })}
                                    placeholder={t('receipts.notes_placeholder')}
                                    rows={3}
                                />
                                <InputError message={errors.notes} />
                            </div>

                            <div className="flex justify-end gap-2 border-t pt-4">
                                <FormActions
                                    cancelHref="/fees/receipts"
                                    processing={processing}
                                />
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
