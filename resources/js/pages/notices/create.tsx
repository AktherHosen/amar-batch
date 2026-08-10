import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';

type Batch = {
    id: number;
    name: string;
};

type PageProps = {
    batches: Batch[];
};

export default function NoticesCreate({ batches }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        content: '',
        batch_id: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/notices');
    };

    return (
        <>
            <Head title="Create Notice" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href="/notices">
                        <Button variant="ghost" size="icon" className="size-9">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <Heading
                        title="Create Notice"
                        description="Post a new announcement"
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
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter notice title"
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Content *</Label>
                                <Textarea
                                    id="content"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="Enter notice content"
                                    rows={6}
                                />
                                <InputError message={errors.content} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="batch_id">Batch (optional)</Label>
                                    <Select
                                        value={data.batch_id}
                                        onValueChange={(value) => setData('batch_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Center-wide (all batches)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="center">Center-wide (all batches)</SelectItem>
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
                                    <Label>Status</Label>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            {data.is_active ? 'Active (published)' : 'Draft'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Link href="/notices">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Create Notice
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

NoticesCreate.layout = {
    breadcrumbs: [
        { title: 'Notice Board', href: '/notices' },
        { title: 'Create', href: '/notices/create' },
    ],
};
