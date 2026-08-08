import { useSidebar } from '@/components/ui/sidebar';

export default function AppLogo() {
    const { state } = useSidebar();

    return (
        <>
            <img src="/logo.png" alt="KAA" className="h-8 w-8 shrink-0 rounded-md object-cover" />
            {state !== 'collapsed' && (
                <div className="grid flex-1 text-left text-sm">
                    <span className="truncate leading-tight font-semibold">
                        Karnaphuli Alpha Academy
                    </span>
                </div>
            )}
        </>
    );
}
