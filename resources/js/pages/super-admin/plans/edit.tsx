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

type Plan = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price_monthly: number;
    price_yearly: number;
    max_students: number;
    max_staff: number;
    max_batches: number;
    features: string[] | null;
    is_active: boolean;
    is_default: boolean;
};

const AVAILABLE_FEATURES = [
    'students', 'batches', 'attendance', 'fees', 'exams',
    'reports', 'notifications', 'custom_branding', 'multi_branch', 'api_access',
];

type PageProps = {
    plan: Plan;
};

export default function PlanEdit({ plan }: PageProps) {
    const [form, setForm] = useState({
        name: plan.name,
        slug: plan.slug,
        description: plan.description || '',
        price_monthly: plan.price_monthly,
        price_yearly: plan.price_yearly,
        max_students: plan.max_students,
        max_staff: plan.max_staff,
        max_batches: plan.max_batches,
        features: plan.features || [],
        is_active: plan.is_active,
        is_default: plan.is_default,
    });
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.put(`/super-admin/plans/${plan.id}`, form, {
            onSuccess: () => toast.success('Plan updated successfully'),
            onFinish: () => setProcessing(false),
        });
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
                    <Heading title={`Edit: ${plan.name}`} description="Update subscription plan" />
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
                                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
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
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

PlanEdit.layout = {
    breadcrumbs: [
        { title: 'Plans', href: '/super-admin/plans' },
        { title: 'Edit' },
    ],
};
