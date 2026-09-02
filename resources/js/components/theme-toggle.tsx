import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';

export default function ThemeToggle() {
    const { updateAppearance, resolvedAppearance } = useAppearance();

    const toggleTheme = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme" className="size-9">
            {resolvedAppearance === 'dark' ? (
                <Moon className="size-4" />
            ) : (
                <Sun className="size-4" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
