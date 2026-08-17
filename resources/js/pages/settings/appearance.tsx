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
import { Head } from '@inertiajs/react';
import { Check, Monitor, Moon, Pipette, Sun } from 'lucide-react';

const MODES: {
    value: Appearance;
    icon: typeof Sun;
    title: string;
    description: string;
}[] = [
    {
        value: 'light',
        icon: Sun,
        title: 'Light',
        description: 'Bright and clean',
    },
    {
        value: 'dark',
        icon: Moon,
        title: 'Dark',
        description: 'Easy on the eyes',
    },
    {
        value: 'system',
        icon: Monitor,
        title: 'System',
        description: 'Follow device setting',
    },
];

export default function Appearance() {
    const {
        appearance,
        accent,
        radius,
        updateAppearance,
        updateAccent,
        updateRadius,
    } = useAppearance();

    const accentIsPreset = ACCENT_KEYS.includes(accent);
    const customColor = accentIsPreset ? DEFAULT_CUSTOM_COLOR : accent;

    return (
        <>
            <Head title="Appearance settings" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    title="Appearance settings"
                    description="Customize how the app looks and feels."
                />

                <Card>
                    <CardHeader className="border-b">
                        <div>
                            <CardTitle className="text-base">
                                Theme mode
                            </CardTitle>
                            <CardDescription>
                                Choose how the app looks on your device.
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
                                                {mode.title}
                                            </span>
                                            <span className="block text-xs text-muted-foreground">
                                                {mode.description}
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
                                Accent color
                            </CardTitle>
                            <CardDescription>
                                Applies to buttons, links, active states and
                                focus rings.
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
                                        <Pipette className="size-3.5 text-muted-foreground" />
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
                                Corner radius
                            </CardTitle>
                            <CardDescription>
                                Roundness of buttons, inputs, cards and dialogs.
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
                                    Custom size
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
                                <span>Sharp</span>
                                <span>Rounded</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b">
                        <div>
                            <CardTitle className="text-base">Preview</CardTitle>
                            <CardDescription>
                                A live sample of your customizations.
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
