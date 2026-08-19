import { Head, router } from '@inertiajs/react';
import { Check, Monitor, Moon, Pipette, Sun, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useLocale } from '@/contexts/locale-context';
import type { Appearance } from '@/hooks/use-appearance';
import {
    ACCENTS,
    ACCENT_KEYS,
    DEFAULT_CUSTOM_COLOR,
    MAX_RADIUS,
    MIN_RADIUS,
    RADIUS_PRESETS,
    RADIUS_PRESET_KEYS,
    useAppearance,
} from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    const {
        appearance,
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
    } = useAppearance();

    const { t } = useLocale();
    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        setSaving(true);
        router.post(
            '/user/settings',
            {
                appearance,
                accent,
                radius,
                date_format: dateFormat,
                time_format: timeFormat,
                sidebar_style: sidebarStyle,
                default_page: defaultPage,
            },
            {
                onSuccess: () => {
                    toast.success(t('toast.saved_successfully'));
                },
                onFinish: () => {
                    setSaving(false);
                },
            },
        );
    };

    const accentIsPreset = ACCENT_KEYS.includes(accent);
    const customColor = accentIsPreset ? DEFAULT_CUSTOM_COLOR : accent;

    const MODES: {
        value: Appearance;
        icon: typeof Sun;
        titleKey: string;
        descKey: string;
    }[] = [
        {
            value: 'light',
            icon: Sun,
            titleKey: 'settings.light',
            descKey: 'settings.light_desc',
        },
        {
            value: 'dark',
            icon: Moon,
            titleKey: 'settings.dark',
            descKey: 'settings.dark_desc',
        },
        {
            value: 'system',
            icon: Monitor,
            titleKey: 'settings.system',
            descKey: 'settings.system_desc',
        },
    ];

    return (
        <>
            <Head title={t('settings.appearance')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    title={t('settings.appearance')}
                    description={t('settings.appearance_desc')}
                />

                <Card>
                    <CardHeader className="border-b">
                        <div>
                            <CardTitle className="text-base">
                                {t('settings.theme_mode')}
                            </CardTitle>
                            <CardDescription>
                                {t('settings.theme_mode_desc')}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {MODES.map((mode) => {
                                const active = appearance === mode.value;
                                const Icon = mode.icon;

                                return (
                                    <button
                                        key={mode.value}
                                        type="button"
                                        onClick={() =>
                                            updateAppearance(mode.value)
                                        }
                                        className={cn(
                                            'relative flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors',
                                            active
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-muted-foreground/40',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                                                active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted text-muted-foreground',
                                            )}
                                        >
                                            <Icon className="size-4" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-medium">
                                                {t(mode.titleKey)}
                                            </span>
                                            <span className="block text-xs text-muted-foreground">
                                                {t(mode.descKey)}
                                            </span>
                                        </span>
                                        {active && (
                                            <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                                <Check className="size-3" />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b">
                        <div>
                            <CardTitle className="text-base">
                                {t('settings.accent_color')}
                            </CardTitle>
                            <CardDescription>
                                {t('settings.accent_color_desc')}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="flex flex-wrap gap-3">
                            {ACCENT_KEYS.map((key) => {
                                const active = accent === key;

                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => updateAccent(key)}
                                        title={ACCENTS[key].label}
                                        aria-label={ACCENTS[key].label}
                                        className={cn(
                                            'relative flex size-9 items-center justify-center rounded-full transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
                                            active
                                                ? 'ring-2 ring-ring ring-offset-2 ring-offset-background'
                                                : '',
                                        )}
                                    >
                                        <span
                                            className="flex size-7 items-center justify-center rounded-full"
                                            style={{
                                                backgroundColor:
                                                    ACCENTS[key].light,
                                            }}
                                        >
                                            {active && (
                                                <Check className="size-3.5 text-white" />
                                            )}
                                        </span>
                                    </button>
                                );
                            })}

                            <label
                                title="Custom color"
                                aria-label="Custom color"
                                className={cn(
                                    'relative flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-full transition-transform focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background focus-within:outline-none hover:scale-110',
                                    !accentIsPreset
                                        ? 'ring-2 ring-ring ring-offset-2 ring-offset-background'
                                        : '',
                                )}
                            >
                                <span
                                    className="flex size-7 items-center justify-center rounded-full"
                                    style={{ backgroundColor: customColor }}
                                >
                                    {!accentIsPreset ? (
                                        <Check className="size-3.5 text-white" />
                                    ) : (
                                        <Pipette className="size-3.5 text-foreground" />
                                    )}
                                </span>
                                <input
                                    type="color"
                                    value={customColor}
                                    onChange={(e) =>
                                        updateAccent(e.target.value)
                                    }
                                    className="absolute inset-0 size-full cursor-pointer opacity-0"
                                />
                            </label>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b">
                        <div>
                            <CardTitle className="text-base">
                                {t('settings.corner_radius')}
                            </CardTitle>
                            <CardDescription>
                                {t('settings.corner_radius_desc')}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-4">
                        <div className="flex justify-center">
                            <div
                                className="flex h-20 w-32 items-center justify-center border border-border bg-muted/50 transition-[border-radius] duration-150"
                                style={{ borderRadius: `${radius}px` }}
                            >
                                <span className="text-xs font-medium text-muted-foreground tabular-nums">
                                    {radius}px
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
                            {RADIUS_PRESET_KEYS.map((key) => {
                                const preset = RADIUS_PRESETS[key];
                                const active = radius === preset.value;

                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() =>
                                            updateRadius(preset.value)
                                        }
                                        className={cn(
                                            'flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
                                            active
                                                ? 'bg-background text-foreground shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground',
                                        )}
                                    >
                                        <span
                                            className="size-3 shrink-0 border border-current"
                                            style={{
                                                borderRadius: `${preset.value}px`,
                                            }}
                                        />
                                        {preset.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="radius-slider"
                                    className="text-sm font-medium"
                                >
                                    {t('settings.custom_size')}
                                </Label>
                                <Badge
                                    variant="outline"
                                    className="tabular-nums"
                                >
                                    {radius}px
                                </Badge>
                            </div>
                            <input
                                id="radius-slider"
                                type="range"
                                min={MIN_RADIUS}
                                max={MAX_RADIUS}
                                step="1"
                                value={radius}
                                onChange={(e) =>
                                    updateRadius(Number(e.target.value))
                                }
                                className="w-full accent-primary"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{t('settings.sharp')}</span>
                                <span>{t('settings.rounded')}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b">
                        <div>
                            <CardTitle className="text-base">
                                {t('settings.date_time')}
                            </CardTitle>
                            <CardDescription>
                                {t('settings.date_time_desc')}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>{t('settings.date_format')}</Label>
                                <Select
                                    value={dateFormat}
                                    onValueChange={updateDateFormat}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DD/MM/YYYY">
                                            DD/MM/YYYY
                                        </SelectItem>
                                        <SelectItem value="MM/DD/YYYY">
                                            MM/DD/YYYY
                                        </SelectItem>
                                        <SelectItem value="YYYY-MM-DD">
                                            YYYY-MM-DD
                                        </SelectItem>
                                        <SelectItem value="DD.MM.YYYY">
                                            DD.MM.YYYY
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>{t('settings.time_format')}</Label>
                                <Select
                                    value={timeFormat}
                                    onValueChange={updateTimeFormat}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="12h">
                                            {t('settings.hour_12')}
                                        </SelectItem>
                                        <SelectItem value="24h">
                                            {t('settings.hour_24')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b">
                        <div>
                            <CardTitle className="text-base">
                                {t('settings.layout')}
                            </CardTitle>
                            <CardDescription>
                                {t('settings.layout_desc')}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>{t('settings.sidebar_style')}</Label>
                                <Select
                                    value={sidebarStyle}
                                    onValueChange={updateSidebarStyle}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full">
                                            {t('settings.sidebar_full')}
                                        </SelectItem>
                                        <SelectItem value="compact">
                                            {t('settings.sidebar_compact')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>{t('settings.default_page')}</Label>
                                <Select
                                    value={defaultPage}
                                    onValueChange={updateDefaultPage}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="dashboard">
                                            {t('nav.dashboard')}
                                        </SelectItem>
                                        <SelectItem value="students">
                                            {t('nav.students')}
                                        </SelectItem>
                                        <SelectItem value="batches">
                                            {t('nav.batches')}
                                        </SelectItem>
                                        <SelectItem value="attendance">
                                            {t('nav.attendance')}
                                        </SelectItem>
                                        <SelectItem value="fees">
                                            {t('nav.fees')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b">
                        <div>
                            <CardTitle className="text-base">
                                {t('settings.preview')}
                            </CardTitle>
                            <CardDescription>
                                {t('settings.preview_desc')}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="flex flex-wrap gap-2">
                            <Button>Primary</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="destructive">Destructive</Button>
                            <Button variant="ghost">Ghost</Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Badge>Default</Badge>
                            <Badge variant="outline">Outline</Badge>
                            <Badge variant="secondary">Secondary</Badge>
                            <Badge variant="destructive">Danger</Badge>
                        </div>

                        <div className="max-w-sm space-y-2">
                            <Label htmlFor="preview-input">Sample input</Label>
                            <Input
                                id="preview-input"
                                placeholder="Type something..."
                            />
                        </div>

                        <label className="flex items-center gap-2">
                            <Checkbox />
                            <span className="text-sm">Accept terms</span>
                        </label>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                        <Save className="size-4" />
                        <span className="ml-2 hidden sm:inline">
                            {saving ? t('actions.saving') : t('actions.save')}
                        </span>
                    </Button>
                </div>
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Appearance settings',
            href: editAppearance(),
        },
    ],
};
