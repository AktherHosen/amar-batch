import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type RefreshButtonProps = {
    onRefresh: () => void;
    refreshing?: boolean;
    className?: string;
};

export function RefreshButton({
    onRefresh,
    refreshing = false,
    className,
}: RefreshButtonProps) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className={`size-8 p-0 ${className ?? ''}`}
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh"
        >
            <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
    );
}