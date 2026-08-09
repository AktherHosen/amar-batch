import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

const AVAILABLE_FEATURES = [
    'students', 'batches', 'attendance', 'fees', 'exams',
    'reports', 'notifications', 'custom_branding', 'multi_branch', 'api_access',
];

export default function PlanCreate() {
    const [form, setForm] = useState({
        name: '',
        slug: '',
        description: '',
        price_monthly: 0,
        price_yearly: 0,
        max_students: 50,
        max_staff: 5,
        max_batches: 10,
        features: [] as string[],
        is_active: true,
        is_default: false,
    });
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.post('/super-admin/plans', form, {
            onSuccess: () => toast.success('Plan created successfully'),
            onFinish: () => setProcessing(false),
        });
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const toggleFeature = (feature: string) => {
        setForm((prev) => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter((f) => f !== feature)
                : [...prev.features, feature],
        }));
    };

    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                        <ArrowLeft className="size-4" />
                    </Button>
                    <Heading title="Create Plan" description="Add a new subscription plan" />
                </div>

                <form onSubmit={handleSubmit} className="max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Plan Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Plan Name</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        setForm((prev) => ({ ...prev, name, slug: generateSlug(name) }));
                                    }}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    value={form.slug}
                                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={form.description}
                                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price_monthly">Monthly Price (৳)</Label>
                                    <Input
                                        id="price_monthly"
                                        type="number"
                                        min={0}
                                        value={form.price_monthly}
                                        onChange={(e) => setForm((prev) => ({ ...prev, price_monthly: Number(e.target.value) }))}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="price_yearly">Yearly Price (৳)</Label>
                                    <Input
                                        id="price_yearly"
                                        type="number"
                                        min={0}
                                        value={form.price_yearly}
                                        onChange={(e) => setForm((prev) => ({ ...prev, price_yearly: Number(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="max_students">Max Students (-1 = unlimited)</Label>
                                    <Input
                                        id="max_students"
                                        type="number"
                                        min={-1}
                                        value={form.max_students}
                                        onChange={(e) => setForm((prev) => ({ ...prev, max_students: Number(e.target.value) }))}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="max_staff">Max Staff (-1 = unlimited)</Label>
                                    <Input
                                        id="max_staff"
                                        type="number"
                                        min={-1}
                                        value={form.max_staff}
                                        onChange={(e) => setForm((prev) => ({ ...prev, max_staff: Number(e.target.value) }))}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="max_batches">Max Batches (-1 = unlimited)</Label>
                                    <Input
                                        id="max_batches"
                                        type="number"
                                        min={-1}
                                        value={form.max_batches}
                                        onChange={(e) => setForm((prev) => ({ ...prev, max_batches: Number(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Features</Label>
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_FEATURES.map((feature) => (
                                        <Button
                                            key={feature}
                                            type="button"
                                            variant={form.features.includes(feature) ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => toggleFeature(feature)}
                                        >
                                            {feature}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="is_active"
                                        checked={form.is_active}
                                        onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))}
                                    />
                                    <Label htmlFor="is_active">Active</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="is_default"
                                        checked={form.is_default}
                                        onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_default: checked }))}
                                    />
                                    <Label htmlFor="is_default">Default Plan</Label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Plan'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

PlanCreate.layout = {
    breadcrumbs: [
        { title: 'Plans', href: '/super-admin/plans' },
        { title: 'Create' },
    ],
};
