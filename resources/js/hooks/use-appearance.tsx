import { useSyncExternalStore } from 'react';

export type ResolvedAppearance = 'light' | 'dark';
export type Appearance = ResolvedAppearance | 'system';

export type AccentDefinition = {
    label: string;
    light: string;
    dark: string;
};

export type RadiusPresetKey = 'sharp' | 'normal' | 'rounded';

export type RadiusPreset = {
    label: string;
    value: number;
    preview: string;
};

export const ACCENTS: Record<string, AccentDefinition> = {
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

export const RADIUS_PRESETS: Record<RadiusPresetKey, RadiusPreset> = {
    sharp: { label: 'Sharp', value: 0, preview: 'rounded-none' },
    normal: { label: 'Normal', value: 10, preview: 'rounded-md' },
    rounded: { label: 'Rounded', value: 16, preview: 'rounded-xl' },
};

export const ACCENT_KEYS = Object.keys(ACCENTS);
export const RADIUS_PRESET_KEYS = Object.keys(
    RADIUS_PRESETS,
) as RadiusPresetKey[];

export const MIN_RADIUS = 0;
export const MAX_RADIUS = 16;
export const DEFAULT_ACCENT = 'neutral';
export const DEFAULT_RADIUS = 10;
export const DEFAULT_CUSTOM_COLOR = '#6366f1';
export const DEFAULT_DATE_FORMAT = 'DD/MM/YYYY';
export const DEFAULT_TIME_FORMAT = '12h';
export const DEFAULT_SIDEBAR_STYLE = 'full';
export const DEFAULT_DEFAULT_PAGE = 'dashboard';

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly accent: string;
    readonly radius: number;
    readonly dateFormat: string;
    readonly timeFormat: string;
    readonly sidebarStyle: string;
    readonly defaultPage: string;
    readonly updateAppearance: (mode: Appearance) => void;
    readonly updateAccent: (accent: string) => void;
    readonly updateRadius: (radius: number) => void;
    readonly updateDateFormat: (format: string) => void;
    readonly updateTimeFormat: (format: string) => void;
    readonly updateSidebarStyle: (style: string) => void;
    readonly updateDefaultPage: (page: string) => void;
};

const listeners = new Set<() => void>();
let currentAppearance: Appearance = 'system';
let currentAccent: string = DEFAULT_ACCENT;
let currentRadius: number = DEFAULT_RADIUS;
let currentDateFormat: string = DEFAULT_DATE_FORMAT;
let currentTimeFormat: string = DEFAULT_TIME_FORMAT;
let currentSidebarStyle: string = DEFAULT_SIDEBAR_STYLE;
let currentDefaultPage: string = DEFAULT_DEFAULT_PAGE;

const prefixes = { main: '', sa: 'sa_' };
type Namespace = keyof typeof prefixes;

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

const isHexColor = (value: string): boolean => /^#[0-9a-fA-F]{6}$/.test(value);

const getStoredAccent = (): string => {
    if (typeof window === 'undefined') {
        return DEFAULT_ACCENT;
    }

    const stored = localStorage.getItem('accent');

    if (stored && (stored in ACCENTS || isHexColor(stored))) {
        return stored;
    }

    return DEFAULT_ACCENT;
};

const getStoredRadius = (): number => {
    if (typeof window === 'undefined') {
        return DEFAULT_RADIUS;
    }

    const stored = localStorage.getItem('radius');

    if (stored === null) {
        return DEFAULT_RADIUS;
    }

    if (stored in RADIUS_PRESETS) {
        return RADIUS_PRESETS[stored as RadiusPresetKey].value;
    }

    const parsed = Number(stored);

    if (!Number.isNaN(parsed)) {
        return Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, Math.round(parsed)));
    }

    return DEFAULT_RADIUS;
};

const getStoredDateFormat = (): string => {
    if (typeof window === 'undefined') {
        return DEFAULT_DATE_FORMAT;
    }

    return localStorage.getItem('dateFormat') || DEFAULT_DATE_FORMAT;
};

const getStoredTimeFormat = (): string => {
    if (typeof window === 'undefined') {
        return DEFAULT_TIME_FORMAT;
    }

    return localStorage.getItem('timeFormat') || DEFAULT_TIME_FORMAT;
};

const getStoredSidebarStyle = (): string => {
    if (typeof window === 'undefined') {
        return DEFAULT_SIDEBAR_STYLE;
    }

    return localStorage.getItem('sidebarStyle') || DEFAULT_SIDEBAR_STYLE;
};

const getStoredDefaultPage = (): string => {
    if (typeof window === 'undefined') {
        return DEFAULT_DEFAULT_PAGE;
    }

    return localStorage.getItem('defaultPage') || DEFAULT_DEFAULT_PAGE;
};

const isDarkMode = (appearance: Appearance): boolean => {
    return appearance === 'dark' || (appearance === 'system' && prefersDark());
};

const getContrastText = (hex: string): string => {
    const normalized = hex.replace('#', '');
    const full =
        normalized.length === 3
            ? normalized
                  .split('')
                  .map((c) => c + c)
                  .join('')
            : normalized;
    const r = parseInt(full.slice(0, 2), 16) / 255;
    const g = parseInt(full.slice(2, 4), 16) / 255;
    const b = parseInt(full.slice(4, 6), 16) / 255;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    return luminance > 0.5 ? 'oklch(0.205 0 0)' : 'oklch(0.985 0 0)';
};

const applyThemeSettings = (): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const root = document.documentElement;
    const isDark = isDarkMode(currentAppearance);
    const isPreset = currentAccent in ACCENTS;
    const accentColor = isPreset
        ? isDark
            ? ACCENTS[currentAccent].dark
            : ACCENTS[currentAccent].light
        : currentAccent;
    const primaryForeground = isPreset
        ? isDark
            ? 'oklch(0.205 0 0)'
            : 'oklch(0.985 0 0)'
        : getContrastText(currentAccent);
    const radius = `${currentRadius}px`;

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
        localStorage.setItem('accent', DEFAULT_ACCENT);
        setCookie('accent', DEFAULT_ACCENT);
    }

    if (!localStorage.getItem('radius')) {
        localStorage.setItem('radius', String(DEFAULT_RADIUS));
        setCookie('radius', String(DEFAULT_RADIUS));
    }

    currentAppearance = getStoredAppearance();
    currentAccent = getStoredAccent();
    currentRadius = getStoredRadius();
    currentDateFormat = getStoredDateFormat();
    currentTimeFormat = getStoredTimeFormat();
    currentSidebarStyle = getStoredSidebarStyle();
    currentDefaultPage = getStoredDefaultPage();
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

    const accent: string = useSyncExternalStore(
        subscribe,
        () => currentAccent,
        () => DEFAULT_ACCENT,
    );

    const radius: number = useSyncExternalStore(
        subscribe,
        () => currentRadius,
        () => DEFAULT_RADIUS,
    );

    const dateFormat: string = useSyncExternalStore(
        subscribe,
        () => currentDateFormat,
        () => DEFAULT_DATE_FORMAT,
    );

    const timeFormat: string = useSyncExternalStore(
        subscribe,
        () => currentTimeFormat,
        () => DEFAULT_TIME_FORMAT,
    );

    const sidebarStyle: string = useSyncExternalStore(
        subscribe,
        () => currentSidebarStyle,
        () => DEFAULT_SIDEBAR_STYLE,
    );

    const defaultPage: string = useSyncExternalStore(
        subscribe,
        () => currentDefaultPage,
        () => DEFAULT_DEFAULT_PAGE,
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

    const updateAccent = (accentKey: string): void => {
        currentAccent = accentKey;

        localStorage.setItem('accent', accentKey);
        setCookie('accent', accentKey);

        applyThemeSettings();
        notify();
    };

    const updateRadius = (radiusValue: number): void => {
        const clamped = Math.min(
            MAX_RADIUS,
            Math.max(MIN_RADIUS, Math.round(radiusValue)),
        );

        currentRadius = clamped;

        localStorage.setItem('radius', String(clamped));
        setCookie('radius', String(clamped));

        applyThemeSettings();
        notify();
    };

    const updateDateFormat = (format: string): void => {
        currentDateFormat = format;
        localStorage.setItem('dateFormat', format);
        notify();
    };

    const updateTimeFormat = (format: string): void => {
        currentTimeFormat = format;
        localStorage.setItem('timeFormat', format);
        notify();
    };

    const updateSidebarStyle = (style: string): void => {
        currentSidebarStyle = style;
        localStorage.setItem('sidebarStyle', style);
        notify();
    };

    const updateDefaultPage = (page: string): void => {
        currentDefaultPage = page;
        localStorage.setItem('defaultPage', page);
        notify();
    };

    return {
        appearance,
        resolvedAppearance,
        accent,
        radius,
        dateFormat,
        timeFormat,
        sidebarStyle,
        defaultPage,
        updateAppearance,
        updateAccent,
        updateRadius,
        updateDateFormat,
        updateTimeFormat,
        updateSidebarStyle,
        updateDefaultPage,
    } as const;
}
