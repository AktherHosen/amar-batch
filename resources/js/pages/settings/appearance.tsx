import { Head } from '@inertiajs/react';
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
    ACCENTS,
    ACCENT_KEYS,
    RADIUS_KEYS,
    RADIUS_OPTIONS,
    useAppearance,
    type Appearance,
} from '@/hooks/use-appearance';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';

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

    return (
        <>
            <Head title="Appearance settings" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    title="Appearance settings"
                    description="Customize how the app looks and feels. Changes apply instantly."
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
                    <CardContent className="pt-4">
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
                    <CardContent className="pt-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {RADIUS_KEYS.map((key) => {
                                const option = RADIUS_OPTIONS[key];
                                const active = radius === key;

                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => updateRadius(key)}
                                        className={cn(
                                            'flex flex-col items-center gap-2.5 rounded-xl border-2 p-3 transition-colors',
                                            active
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-muted-foreground/40',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'h-9 w-14 border-2 border-current bg-muted',
                                                option.preview,
                                            )}
                                        />
                                        <span className="text-sm font-medium">
                                            {option.label}
                                        </span>
                                    </button>
                                );
                            })}
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
