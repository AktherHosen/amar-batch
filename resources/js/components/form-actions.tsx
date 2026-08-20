import { Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/contexts/locale-context';

type FormActionsProps = {
    cancelHref?: string;
    onCancel?: () => void;
    processing: boolean;
};

export function FormActions({
    cancelHref,
    onCancel,
    processing,
}: FormActionsProps) {
    const { t } = useLocale();

    return (
        <div className="flex justify-end gap-2">
            {onCancel ? (
                <Button type="button" variant="outline" onClick={onCancel}>
                    <ArrowLeft className="size-4" />
                    {t('actions.cancel')}
                </Button>
            ) : cancelHref ? (
                <Button type="button" variant="outline" asChild>
                    <Link href={cancelHref}>
                        <ArrowLeft className="size-4" />
                        {t('actions.cancel')}
                    </Link>
                </Button>
            ) : null}
            <Button type="submit" disabled={processing}>
                <Save className="size-4" />
                {processing ? t('actions.saving') : t('actions.save')}
            </Button>
        </div>
    );
}
