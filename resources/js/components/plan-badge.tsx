import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

type PlanBadgeProps = {
    isPopular?: boolean;
    isCurrent?: boolean;
    isDefault?: boolean;
    label?: string;
    popularLabel?: string;
    defaultLabel?: string;
};

export default function PlanBadge({ isPopular, isCurrent, isDefault, label, popularLabel, defaultLabel }: PlanBadgeProps) {
    if (isPopular) {
        return (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                    <Sparkles className="mr-1 h-3 w-3" />
                    {popularLabel || label || 'Popular'}
                </Badge>
            </div>
        );
    }

    if (isCurrent) {
        return (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge>{label || 'Current Plan'}</Badge>
            </div>
        );
    }

    if (isDefault) {
        return (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="secondary">{defaultLabel || 'Free Trial'}</Badge>
            </div>
        );
    }

    return null;
}
