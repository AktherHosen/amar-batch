import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ACCENTS,
    ACCENT_KEYS,
    RADIUS_KEYS,
    RADIUS_OPTIONS,
    useAppearance,
} from '@/hooks/use-appearance';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    const { accent, radius, updateAccent, updateRadius } = useAppearance();

    return (
        <>
            <Head title="Appearance settings" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    title="Appearance settings"
                    description="Customize how the app looks and feels for you."
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Theme mode</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AppearanceTabs />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Accent color</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Applies instantly to buttons, links, active states
                            and focus rings across the whole site.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {ACCENT_KEYS.map((key) => {
                                const active = accent === key;

                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => updateAccent(key)}
                                        title={ACCENTS[key].label}
                                        className={cn(
                                            'flex size-9 items-center justify-center rounded-full border-2 transition-transform hover:scale-105',
                                            active
                                                ? 'border-foreground'
                                                : 'border-transparent',
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
                                                <Check className="size-4 text-white" />
                                            )}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Corner radius</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Controls the roundness of buttons, inputs, cards and
                            dialogs site-wide.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-3">
                            {RADIUS_KEYS.map((key) => {
                                const option = RADIUS_OPTIONS[key];
                                const active = radius === key;

                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => updateRadius(key)}
                                        className={cn(
                                            'flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-colors',
                                            active
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-muted-foreground/40',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'h-10 w-16 border-2 border-current bg-background',
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
                    <CardHeader>
                        <CardTitle>Preview</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            A live sample of how your customizations look.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
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

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                        <Sun className="size-4 text-muted-foreground" />
                        <span className="text-sm">Light mode</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                        <Moon className="size-4 text-muted-foreground" />
                        <span className="text-sm">Dark mode</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                        <Monitor className="size-4 text-muted-foreground" />
                        <span className="text-sm">System default</span>
                    </div>
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
