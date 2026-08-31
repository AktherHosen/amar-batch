import { Check, Minus } from 'lucide-react';
import PlanBadge from '@/components/plan-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
    features: string[];
    is_default: boolean;
};

const allFeatures = [
    'attendance',
    'fees',
    'exams',
    'reports',
    'notifications',
    'custom_branding',
    'multi_branch',
    'api_access',
];

const featureLabels: Record<string, string> = {
    attendance: 'plan.feature_attendance',
    fees: 'plan.feature_fees',
    exams: 'plan.feature_exams',
    reports: 'plan.feature_reports',
    notifications: 'plan.feature_notifications',
    custom_branding: 'plan.feature_custom_branding',
    multi_branch: 'plan.feature_multi_branch',
    api_access: 'plan.feature_api_access',
};

type PlanCardProps = {
    plan: Plan;
    annual: boolean;
    isPopular?: boolean;
    isCurrent?: boolean;
    isDefault?: boolean;
    currentLabel?: string;
    popularLabel?: string;
    defaultLabel?: string;
    cta?: React.ReactNode;
};

export default function PlanCard({
    plan,
    annual,
    isPopular = false,
    isCurrent = false,
    isDefault = false,
    currentLabel,
    popularLabel,
    defaultLabel,
    cta,
}: PlanCardProps) {
    const { t, formatCurrency } = useLocale();
    const price = annual ? plan.price_yearly : plan.price_monthly;
    const period = annual ? t('plan.year') : t('plan.month');

    const formatLimit = (value: number) => {
        if (value === -1) return '∞';
        return value.toString();
    };

    return (
        <Card
            className={`relative flex flex-col transition-shadow hover:shadow-md ${
                isPopular ? 'scale-[1.02] border-primary shadow-lg shadow-primary/10' : ''
            } ${isCurrent ? 'border-primary ring-1 ring-primary' : ''}`}
        >
            <PlanBadge
                isPopular={isPopular}
                isCurrent={isCurrent}
                isDefault={isDefault}
                popularLabel={popularLabel || t('plan.popular')}
                defaultLabel={defaultLabel || t('plan.free_trial')}
                label={currentLabel}
            />
            <CardHeader className="flex flex-col items-start gap-1.5 pt-8">
                <CardTitle className="text-xl font-bold tracking-tight">{plan.name}</CardTitle>
                {plan.description && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>
                )}
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
                <div className="mb-6">
                    {price === 0 ? (
                        <div className="text-3xl font-bold sm:text-4xl">{t('plan.free')}</div>
                    ) : (
                        <div className="text-3xl font-bold tracking-tight sm:text-4xl">
                            {formatCurrency(price)}
                            <span className="text-sm font-normal text-muted-foreground">/{period}</span>
                        </div>
                    )}
                </div>

                <Separator className="mb-6" />

                <div className="mb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    {t('plan.limits')}
                </div>
                <div className="mb-6 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('plan.students')}</span>
                        <span className="font-medium">{formatLimit(plan.max_students)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('plan.staff')}</span>
                        <span className="font-medium">{formatLimit(plan.max_staff)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('plan.batches')}</span>
                        <span className="font-medium">{formatLimit(plan.max_batches)}</span>
                    </div>
                </div>

                <div className="mb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    {t('plan.includes')}
                </div>
                <ul className="mb-6 flex-1 space-y-2 text-sm">
                    {allFeatures.map((feature) => {
                        const included = plan.features?.includes(feature) ?? false;
                        return (
                            <li key={feature} className="flex items-center gap-2">
                                <span
                                    className={`flex size-4 shrink-0 items-center justify-center rounded-full ${
                                        included ? 'bg-green-500/10' : 'bg-muted'
                                    }`}
                                >
                                    {included ? (
                                        <Check className="size-3 text-green-600" />
                                    ) : (
                                        <Minus className="size-3 text-muted-foreground" />
                                    )}
                                </span>
                                <span className={included ? 'text-foreground' : 'text-muted-foreground'}>
                                    {t(featureLabels[feature])}
                                </span>
                            </li>
                        );
                    })}
                </ul>

                {cta && <div className="mt-auto pt-2">{cta}</div>}
            </CardContent>
        </Card>
    );
}
