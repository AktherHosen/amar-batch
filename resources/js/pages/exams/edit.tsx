import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
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
import exams from '@/routes/exams';
import { useLocale } from '@/contexts/locale-context';

type Exam = {
    id: number;
    title: string;
    subject: string | null;
    batch_id: number | null;
    date: string | null;
    total_marks: number;
    passing_marks: number;
    notes: string | null;
};

type Batch = {
    id: number;
    name: string;
};

type PageProps = {
    exam: Exam;
    batches: Batch[];
};

export default function ExamsEdit({ exam, batches }: PageProps) {
    const { t } = useLocale();
    const { data, setData, put, processing, errors } = useForm({
        title: exam.title,
        subject: exam.subject || '',
        batch_id: exam.batch_id ? String(exam.batch_id) : '',
        date: exam.date ? exam.date.split('T')[0] : '',
        total_marks: String(exam.total_marks),
        passing_marks: String(exam.passing_marks),
        notes: exam.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(exams.update(exam.id), { preserveScroll: true });
    };

    return (
        <>
            <Head title={t('exams.edit')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={exams.show(exam.id)}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 size-4" />
                            {t('actions.back')}
                        </Button>
                    </Link>
                    <Heading title={t('exams.edit')} description={t('exams.update_details')} />
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="title">{t('exams.title')} *</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                    />
                                    <InputError message={errors.title} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subject">{t('exams.subject')}</Label>
                                    <Input
                                        id="subject"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                    />
                                    <InputError message={errors.subject} />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>{t('exams.batch')}</Label>
                                    <Select value={data.batch_id} onValueChange={(value) => setData('batch_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('exams.select_batch')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {batches.map((batch) => (
                                                <SelectItem key={batch.id} value={String(batch.id)}>
                                                    {batch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.batch_id} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date">{t('exams.date')}</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                    />
                                    <InputError message={errors.date} />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="total_marks">{t('exams.total_marks')} *</Label>
                                    <Input
                                        id="total_marks"
                                        type="number"
                                        min="1"
                                        value={data.total_marks}
                                        onChange={(e) => setData('total_marks', e.target.value)}
                                    />
                                    <InputError message={errors.total_marks} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="passing_marks">{t('exams.passing_marks')} *</Label>
                                    <Input
                                        id="passing_marks"
                                        type="number"
                                        min="0"
                                        value={data.passing_marks}
                                        onChange={(e) => setData('passing_marks', e.target.value)}
                                    />
                                    <InputError message={errors.passing_marks} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">{t('exams.notes')}</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                />
                                <InputError message={errors.notes} />
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? t('classes.saving') : t('actions.save')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ExamsEdit.layout = {
    breadcrumbs: [
        { title: 'Exams', href: exams.index() },
        { title: 'Edit', href: '' },
    ],
};
