import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations, type Locale } from './translations';

export const STORAGE_KEY = 'locale';

function getInitialLocale(): Locale {
    if (typeof window === 'undefined') {
        return 'en';
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored === 'en' || stored === 'bn') {
            return stored;
        }
    } catch {}

    return 'en';
}

void i18n.use(initReactI18next).init({
    resources: {
        en: { translation: translations.en },
        bn: { translation: translations.bn },
    },
    lng: getInitialLocale(),
    fallbackLng: 'en',
    supportedLngs: ['en', 'bn'],
    interpolation: {
        // React already safely escapes rendered output.
        escapeValue: false,
    },
    returnEmptyString: false,
    react: {
        useSuspense: false,
    },
});

export { i18n };

export async function changeLanguage(locale: Locale): Promise<void> {
    await i18n.changeLanguage(locale);

    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(STORAGE_KEY, locale);
    } catch {}

    document.documentElement.setAttribute('data-locale', locale);
    document.documentElement.setAttribute('lang', locale);
}