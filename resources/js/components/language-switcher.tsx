import { useLocale } from '@/contexts/locale-context';
import { Button } from '@/components/ui/button';

export default function LanguageSwitcher() {
    const { locale, setLocale } = useLocale();

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
            className="gap-1"
        >
            {locale === 'en' ? 'বাং' : 'EN'}
        </Button>
    );
}
