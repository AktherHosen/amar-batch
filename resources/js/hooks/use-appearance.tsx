import { useSyncExternalStore } from 'react';

export type ResolvedAppearance = 'light' | 'dark';
export type Appearance = ResolvedAppearance | 'system';

export type AccentKey =
    | 'neutral'
    | 'blue'
    | 'indigo'
    | 'violet'
    | 'green'
    | 'teal'
    | 'orange'
    | 'rose'
    | 'red';

export type RadiusKey = 'sharp' | 'normal' | 'rounded';

export type AccentDefinition = {
    label: string;
    light: string;
    dark: string;
};

export type RadiusDefinition = {
    label: string;
    value: string;
    preview: string;
};

export const ACCENTS: Record<AccentKey, AccentDefinition> = {
    neutral: {
        label: 'Neutral',
        light: 'oklch(0.205 0 0)',
        dark: 'oklch(0.985 0 0)',
    },
    blue: {
        label: 'Blue',
        light: 'oklch(0.546 0.245 262.881)',
        dark: 'oklch(0.623 0.214 259.815)',
    },
    indigo: {
        label: 'Indigo',
        light: 'oklch(0.511 0.262 276.966)',
        dark: 'oklch(0.585 0.233 277.117)',
    },
    violet: {
        label: 'Violet',
        light: 'oklch(0.541 0.281 293.009)',
        dark: 'oklch(0.606 0.25 292.717)',
    },
    green: {
        label: 'Green',
        light: 'oklch(0.627 0.194 149.214)',
        dark: 'oklch(0.696 0.17 162.48)',
    },
    teal: {
        label: 'Teal',
        light: 'oklch(0.6 0.118 184.704)',
        dark: 'oklch(0.704 0.14 182.503)',
    },
    orange: {
        label: 'Orange',
        light: 'oklch(0.646 0.222 41.116)',
        dark: 'oklch(0.705 0.213 47.604)',
    },
    rose: {
        label: 'Rose',
        light: 'oklch(0.645 0.246 16.439)',
        dark: 'oklch(0.712 0.194 13.428)',
    },
    red: {
        label: 'Red',
        light: 'oklch(0.577 0.245 27.325)',
        dark: 'oklch(0.704 0.191 22.216)',
    },
};

export const RADIUS_OPTIONS: Record<RadiusKey, RadiusDefinition> = {
    sharp: { label: 'Sharp', value: '0rem', preview: 'rounded-none' },
    normal: { label: 'Normal', value: '0.625rem', preview: 'rounded-md' },
    rounded: { label: 'Rounded', value: '1rem', preview: 'rounded-xl' },
};

export const ACCENT_KEYS = Object.keys(ACCENTS) as AccentKey[];
export const RADIUS_KEYS = Object.keys(RADIUS_OPTIONS) as RadiusKey[];

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly accent: AccentKey;
    readonly radius: RadiusKey;
    readonly updateAppearance: (mode: Appearance) => void;
    readonly updateAccent: (accent: AccentKey) => void;
    readonly updateRadius: (radius: RadiusKey) => void;
};

const listeners = new Set<() => void>();
let currentAppearance: Appearance = 'system';
let currentAccent: AccentKey = 'neutral';
let currentRadius: RadiusKey = 'normal';

const prefersDark = (): boolean => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const getStoredAppearance = (): Appearance => {
    if (typeof window === 'undefined') {
        return 'system';
    }

    return (localStorage.getItem('appearance') as Appearance) || 'system';
};

const getStoredAccent = (): AccentKey => {
    if (typeof window === 'undefined') {
        return 'neutral';
    }

    const stored = localStorage.getItem('accent');

    return stored && stored in ACCENTS ? (stored as AccentKey) : 'neutral';
};

const getStoredRadius = (): RadiusKey => {
    if (typeof window === 'undefined') {
        return 'normal';
    }

    const stored = localStorage.getItem('radius');

    return stored && stored in RADIUS_OPTIONS
        ? (stored as RadiusKey)
        : 'normal';
};

const isDarkMode = (appearance: Appearance): boolean => {
    return appearance === 'dark' || (appearance === 'system' && prefersDark());
};

const applyThemeSettings = (): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const root = document.documentElement;
    const isDark = isDarkMode(currentAppearance);
    const accent = ACCENTS[currentAccent];
    const radius = RADIUS_OPTIONS[currentRadius].value;
    const primaryForeground = isDark ? 'oklch(0.205 0 0)' : 'oklch(0.985 0 0)';
    const accentColor = isDark ? accent.dark : accent.light;

    root.style.setProperty('--primary', accentColor);
    root.style.setProperty('--primary-foreground', primaryForeground);
    root.style.setProperty('--ring', accentColor);
    root.style.setProperty('--sidebar-primary', accentColor);
    root.style.setProperty('--sidebar-primary-foreground', primaryForeground);

    root.style.setProperty('--radius', radius);
    root.style.setProperty('--radius-lg', radius);
    root.style.setProperty('--radius-md', `calc(${radius} - 2px)`);
    root.style.setProperty('--radius-sm', `calc(${radius} - 4px)`);
};

const applyTheme = (appearance: Appearance): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const isDark = isDarkMode(appearance);

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';

    applyThemeSettings();
};

const subscribe = (callback: () => void) => {
    listeners.add(callback);

    return () => listeners.delete(callback);
};

const notify = (): void => listeners.forEach((listener) => listener());

const mediaQuery = (): MediaQueryList | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = (): void => applyTheme(currentAppearance);

export function initializeTheme(): void {
    if (typeof window === 'undefined') {
        return;
    }

    if (!localStorage.getItem('appearance')) {
        localStorage.setItem('appearance', 'system');
        setCookie('appearance', 'system');
    }

    if (!localStorage.getItem('accent')) {
        localStorage.setItem('accent', 'neutral');
        setCookie('accent', 'neutral');
    }

    if (!localStorage.getItem('radius')) {
        localStorage.setItem('radius', 'normal');
        setCookie('radius', 'normal');
    }

    currentAppearance = getStoredAppearance();
    currentAccent = getStoredAccent();
    currentRadius = getStoredRadius();
    applyTheme(currentAppearance);

    // Set up system theme change listener
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance(): UseAppearanceReturn {
    const appearance: Appearance = useSyncExternalStore(
        subscribe,
        () => currentAppearance,
        () => 'system',
    );

    const accent: AccentKey = useSyncExternalStore(
        subscribe,
        () => currentAccent,
        () => 'neutral',
    );

    const radius: RadiusKey = useSyncExternalStore(
        subscribe,
        () => currentRadius,
        () => 'normal',
    );

    const resolvedAppearance: ResolvedAppearance = isDarkMode(appearance)
        ? 'dark'
        : 'light';

    const updateAppearance = (mode: Appearance): void => {
        currentAppearance = mode;

        // Store in localStorage for client-side persistence...
        localStorage.setItem('appearance', mode);

        // Store in cookie for SSR...
        setCookie('appearance', mode);

        applyTheme(mode);
        notify();
    };

    const updateAccent = (accentKey: AccentKey): void => {
        currentAccent = accentKey;

        localStorage.setItem('accent', accentKey);
        setCookie('accent', accentKey);

        applyThemeSettings();
        notify();
    };

    const updateRadius = (radiusKey: RadiusKey): void => {
        currentRadius = radiusKey;

        localStorage.setItem('radius', radiusKey);
        setCookie('radius', radiusKey);

        applyThemeSettings();
        notify();
    };

    return {
        appearance,
        resolvedAppearance,
        accent,
        radius,
        updateAppearance,
        updateAccent,
        updateRadius,
    } as const;
}
