import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useLocale } from '@/contexts/locale-context';

type FormSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    onSubmit?: () => void;
    onCancel?: () => void;
    submitLabel?: string;
    cancelLabel?: string;
    processing?: boolean;
    submitDisabled?: boolean;
    submitForm?: string;
    wide?: boolean;
};

export default function FormSheet({
    open,
    onOpenChange,
    title,
    description,
    children,
    onSubmit,
    onCancel,
    submitLabel,
    cancelLabel,
    processing = false,
    submitDisabled = false,
    submitForm,
    wide = false,
}: FormSheetProps) {
    const { t } = useLocale();

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            onOpenChange(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className={wide ? 'sm:max-w-2xl' : 'sm:max-w-md'}>
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    {description && <SheetDescription>{description}</SheetDescription>}
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-4">{children}</div>
                <SheetFooter>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                        {cancelLabel ?? t('actions.cancel')}
                    </Button>
                    {onSubmit && (
                        <Button
                            type="submit"
                            form={submitForm}
                            disabled={processing || submitDisabled}
                            onClick={onSubmit}
                        >
                            {processing
                                ? t('actions.updating')
                                : (submitLabel ?? t('actions.update'))}
                        </Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
