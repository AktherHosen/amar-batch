import { Link } from '@inertiajs/react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export default function CellTitle({
    title,
    href,
    className = 'max-w-[220px]',
}: {
    title: string;
    href?: string;
    className?: string;
}) {
    const text = (
        <span className={cn('block truncate', className)}>{title}</span>
    );

    const trigger = href ? (
        <Link href={href} className="font-medium hover:underline">
            {text}
        </Link>
    ) : (
        <span className="font-medium">{text}</span>
    );

    if (title.length <= 20) {
        return trigger;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{trigger}</TooltipTrigger>
            <TooltipContent>{title}</TooltipContent>
        </Tooltip>
    );
}
