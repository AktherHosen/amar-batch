import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { i18n, changeLanguage } from '@/i18n';
import {
    formatBanglaNumber,
    formatCurrency as formatCurrencyForLocale,
    formatDate as formatDateForLocale,
    formatTime as formatTimeForLocale
    
} from '@/i18n/translations';
import type {Locale} from '@/i18n/translations';

type LocaleContextType = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
    formatDate: (date: string | Date) => string;
    formatTime: (date: string | Date) => string;
    formatCurrency: (amount: number) => string;
    formatNumber: (num: number) => string;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
    const { t: translate } = useTranslation();
    const [mounted, setMounted] = useState(false);

    const locale: Locale =
        ((i18n.resolvedLanguage || i18n.language) as Locale) || 'en';

    useEffect(() => {
        setMounted(true);
        document.documentElement.setAttribute('data-locale', locale);
        document.documentElement.setAttribute('lang', locale);
    }, [locale]);

    const handleSetLocale = (newLocale: Locale) => {
        void changeLanguage(newLocale);
    };

    const t = (key: string): string => translate(key);

    const formatDateFn = (date: string | Date) => formatDateForLocale(date, locale);
    const formatTimeFn = (date: string | Date) => formatTimeForLocale(date, locale);
    const formatCurrencyFn = (amount: number) => formatCurrencyForLocale(amount, locale);
    const formatNumberFn = (num: number) =>
        locale === 'bn' ? formatBanglaNumber(num) : num.toLocaleString('en-US');

    if (!mounted) {
        return null;
    }

    return (
        <LocaleContext.Provider
            value={{
                locale,
                setLocale: handleSetLocale,
                t,
                formatDate: formatDateFn,
                formatTime: formatTimeFn,
                formatCurrency: formatCurrencyFn,
                formatNumber: formatNumberFn,
            }}
        >
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    const context = useContext(LocaleContext);

    if (!context) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }

    return context;
}