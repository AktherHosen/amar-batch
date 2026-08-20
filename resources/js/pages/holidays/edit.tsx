import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormActions } from '@/components/form-actions';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
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

type Holiday = {
    id: number;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string;
    type: string;
};

type PageProps = {
    holiday: Holiday;
};

export default function HolidaysEdit({ holiday }: PageProps) {
    const { data, setData, put, processing, errors } = useForm({
        title: holiday.title,
        description: holiday.description || '',
        start_date: holiday.start_date.split('T')[0],
        end_date: holiday.end_date.split('T')[0],
        type: holiday.type,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/holidays/${holiday.id}`);
    };

    return (
        <>
            <Head title={`Edit ${holiday.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href="/holidays">
                        <Button variant="ghost" size="icon" className="size-9">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <Heading
                        title={`Edit ${holiday.title}`}
                        description="Update holiday details"
                    />
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    placeholder="Enter holiday title"
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Enter holiday description"
                                    rows={3}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">
                                        Start Date *
                                    </Label>
                                    <DatePicker
                                        value={data.start_date}
                                        onValueChange={(value) =>
                                            setData('start_date', value)
                                        }
                                        placeholder="Select start date"
                                    />
                                    <InputError message={errors.start_date} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_date">End Date *</Label>
                                    <DatePicker
                                        value={data.end_date}
                                        onValueChange={(value) =>
                                            setData('end_date', value)
                                        }
                                        placeholder="Select end date"
                                    />
                                    <InputError message={errors.end_date} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Type *</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) =>
                                            setData('type', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="holiday">
                                                Holiday
                                            </SelectItem>
                                            <SelectItem value="exam">
                                                Exam Period
                                            </SelectItem>
                                            <SelectItem value="other">
                                                Other
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.type} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <FormActions
                                    cancelHref="/holidays"
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

HolidaysEdit.layout = {
    breadcrumbs: [
        { title: 'Holiday Calendar', href: '/holidays' },
        { title: 'Edit', href: '#' },
    ],
};
