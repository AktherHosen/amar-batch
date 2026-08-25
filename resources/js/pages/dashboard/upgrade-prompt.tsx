import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';
import subscription from '@/routes/subscription';

type Props = {
    feature: string;
    title: string;
    description: string;
};

const featureDetails: Record<string, { title: string; description: string }> = {
    exams: {
        title: 'Exams Management',
        description: 'Track exams, record results, and analyze student performance.',
    },
    reports: {
        title: 'Reports & Analytics',
        description: 'Get insights with charts and detailed analytics.',
    },
    notifications: {
        title: 'In-App Notifications',
        description: 'Send real-time notifications to teachers and students.',
    },
    multi_branch: {
        title: 'Multi-Branch Support',
        description: 'Manage multiple coaching center locations.',
    },
    api_access: {
        title: 'API Access',
        description: 'Integrate with external systems via API tokens.',
    },
    custom_branding: {
        title: 'Custom Branding',
        description: 'Customize your coaching center branding.',
    },
};

export default function UpgradePrompt({ feature, title, description }: Props) {
    const { t } = useLocale();
    const details = featureDetails[feature] ?? { title, description };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center sm:flex-row sm:gap-4 sm:text-left">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Lock className="size-5 text-primary" />
                    </div>
                    <div className="mt-3 sm:mt-0">
                        <h3 className="text-sm font-medium">{details.title}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {details.description}
                        </p>
                    </div>
                    <Link href={subscription.index().url} className="mt-3 shrink-0 sm:mt-0">
                        <Button size="sm" variant="outline">
                            {t('dashboard.view_plans') ?? 'View Plans'}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </motion.div>
    );
}
