import { Link, router } from '@inertiajs/react';
import { EllipsisVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLocale } from '@/contexts/locale-context';

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

type PageProps = {
    plans: Plan[];
};

export default function PlansIndex({ plans }: PageProps) {
    const { t } = useLocale();
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Plan | null }>({
        open: false,
        item: null,
    });

    const handleDelete = (plan: Plan) => {
        setDeleteDialog({ open: true, item: plan });
    };

    const confirmDelete = () => {
        if (deleteDialog.item) {
            router.delete(`/dashboard/sa/plans/${deleteDialog.item.id}`);
            toast.success(t('toast.deleted_successfully'));
            setDeleteDialog({ open: false, item: null });
        }
    };

    const formatLimit = (value: number) => (value === -1 ? '∞' : value.toString());

    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Subscription Plans" description="Manage pricing and limits" />
                    <Link href="/dashboard/sa/plans/create">
                        <Button>
                            <Plus className="mr-2 size-4" />
                            Create Plan
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {plans.map((plan) => (
                        <Card key={plan.id} className="relative">
                            <CardContent className="pt-6">
                                <div className="mb-2 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">{plan.name}</h3>
                                        {plan.is_default && (
                                            <Badge variant="secondary" className="mt-1">Default</Badge>
                                        )}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="size-8 p-0">
                                                <EllipsisVertical className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/sa/plans/${plan.id}/edit`}>
                                                    <Pencil className="mr-2 size-4" />
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(plan)}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="mr-2 size-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {plan.description && (
                                    <p className="mb-4 text-sm text-muted-foreground">{plan.description}</p>
                                )}

                                <div className="mb-4">
                                    <div className="text-3xl font-bold">
                                        {plan.price_monthly === 0 ? 'Free' : `৳${plan.price_monthly}`}
                                    </div>
                                    {plan.price_monthly > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            ৳{plan.price_yearly}/year (save {Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%)
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Students</span>
                                        <span className="font-medium">{formatLimit(plan.max_students)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Staff</span>
                                        <span className="font-medium">{formatLimit(plan.max_staff)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Batches</span>
                                        <span className="font-medium">{formatLimit(plan.max_batches)}</span>
                                    </div>
                                </div>

                                {plan.features && plan.features.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-1">
                                        {plan.features.map((feature) => (
                                            <Badge key={feature} variant="outline" className="text-xs">
                                                {feature}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, item: deleteDialog.item })}
                title="Delete Plan"
                description={`Are you sure you want to delete "${deleteDialog.item?.name}"? This may affect tenants using this plan.`}
                confirmText="Delete"
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

