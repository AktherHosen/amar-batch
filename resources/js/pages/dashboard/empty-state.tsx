import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
    icon: LucideIcon;
    title: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
};

export default function DashboardEmptyState({ icon: Icon, title, description, actionLabel, actionHref }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
        >
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Icon className="size-6 text-muted-foreground" />
            </div>
            <h3 className="mt-3 text-sm font-medium">{title}</h3>
            {description && (
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            )}
            {actionLabel && actionHref && (
                <Link href={actionHref} className="mt-4">
                    <Button size="sm">{actionLabel}</Button>
                </Link>
            )}
        </motion.div>
    );
}
