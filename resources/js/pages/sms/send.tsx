import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Send, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/contexts/locale-context';

type Student = {
    id: number;
    name: string;
    phone: string | null;
    coaching_class: string | null;
};

type PageProps = {
    students: Student[];
};

export default function SmsSend({ students }: PageProps) {
    const { t } = useLocale();
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
    const [customPhone, setCustomPhone] = useState('');
    const [search, setSearch] = useState('');

    const { data, setData, post, processing, reset } = useForm({
        recipients: [] as string[],
        message: '',
    });

    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);

    const filteredStudents = students.filter(
        (s) =>
            s.phone &&
            (s.name.toLowerCase().includes(search.toLowerCase()) ||
                s.coaching_class?.toLowerCase().includes(search.toLowerCase())),
    );

    const addStudent = (student: Student) => {
        if (!student.phone || selectedStudents.some((s) => s.id === student.id)) return;
        const updated = [...selectedStudents, student];
        setSelectedStudents(updated);
        setData('recipients', updated.map((s) => s.phone!));
    };

    const removeStudent = (studentId: number) => {
        const updated = selectedStudents.filter((s) => s.id !== studentId);
        setSelectedStudents(updated);
        setData('recipients', updated.map((s) => s.phone!));
    };

    const addCustomPhone = () => {
        const phone = customPhone.trim();
        if (!phone) return;
        if (data.recipients.includes(phone)) return;
        setData('recipients', [...data.recipients, phone]);
        setCustomPhone('');
    };

    const removeRecipient = (phone: string) => {
        const updated = data.recipients.filter((p) => p !== phone);
        setData('recipients', updated);
        setSelectedStudents(selectedStudents.filter((s) => s.phone !== phone));
    };

    const handleSend = () => {
        if (data.recipients.length === 0) {
            toast.error('Please add at least one recipient');
            return;
        }
        if (!data.message.trim()) {
            toast.error('Please enter a message');
            return;
        }

        post('/sms/send', {
            onSuccess: () => {
                reset();
                setSelectedStudents([]);
            },
        });
    };

    return (
        <>
            <Head title="Send SMS" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading title="Send SMS" description="Send SMS to students or custom phone numbers" />

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <UserPlus className="size-4 text-muted-foreground" />
                                Recipients
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Input
                                placeholder="Search students by name or class..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                            <div className="max-h-60 space-y-1 overflow-y-auto">
                                {filteredStudents.map((student) => {
                                    const isSelected = selectedStudents.some((s) => s.id === student.id);
                                    return (
                                        <div
                                            key={student.id}
                                            className={`flex cursor-pointer items-center justify-between rounded-lg border p-2 transition-colors ${
                                                isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                                            }`}
                                            onClick={() => (isSelected ? removeStudent(student.id) : addStudent(student))}
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">{student.name}</p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {student.phone} {student.coaching_class && `· ${student.coaching_class}`}
                                                </p>
                                            </div>
                                            {isSelected && <CheckCircle2 className="size-4 shrink-0 text-primary" />}
                                        </div>
                                    );
                                })}
                                {filteredStudents.length === 0 && (
                                    <p className="py-4 text-center text-sm text-muted-foreground">No students found</p>
                                )}
                            </div>

                            <Separator />

                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add custom phone number"
                                    value={customPhone}
                                    onChange={(e) => setCustomPhone(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomPhone())}
                                />
                                <Button variant="outline" onClick={addCustomPhone}>
                                    Add
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Send className="size-4 text-muted-foreground" />
                                Compose
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex flex-wrap gap-1.5">
                                {data.recipients.map((phone) => (
                                    <Badge key={phone} variant="secondary" className="gap-1">
                                        {phone}
                                        <button
                                            onClick={() => removeRecipient(phone)}
                                            className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </Badge>
                                ))}
                                {data.recipients.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No recipients selected</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Message</Label>
                                <Textarea
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder="Type your SMS message here..."
                                    rows={6}
                                    maxLength={1000}
                                />
                                <p className="text-right text-xs text-muted-foreground">{data.message.length}/1000</p>
                            </div>

                            <Button
                                onClick={handleSend}
                                disabled={processing || data.recipients.length === 0 || !data.message.trim()}
                                className="w-full"
                            >
                                <Send className="mr-2 size-4" />
                                {processing ? 'Sending...' : `Send SMS to ${data.recipients.length} recipient(s)`}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
