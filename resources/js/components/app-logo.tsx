import { useSidebar } from '@/components/ui/sidebar';

export default function AppLogo() {
    const { state } = useSidebar();

    return (
        <div className="grid flex-1 text-left text-sm">
            <span className="truncate leading-tight font-semibold">
                {state === 'collapsed' ? 'KAA' : 'Karnaphuli Alpha Academy'}
            </span>
        </div>
    );
}
