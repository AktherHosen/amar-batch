import { Head, useForm, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
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

export default function HolidaysCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        type: 'holiday',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/holidays');
    };

    return (
        <>
            <Head title="Add Holiday" />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
            >
                <div className="flex min-w-0 items-center gap-4">
                    <Link href="/holidays" className="shrink-0">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div className="min-w-0">
                        <Heading
                            title="Add Holiday"
                            description="Add a new holiday or event"
                        />
                    </div>
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
            </motion.div>
        </>
    );
}

HolidaysCreate.layout = {
    breadcrumbs: [
        { title: 'Holiday Calendar', href: '/holidays' },
        { title: 'Add', href: '/holidays/create' },
    ],
};
