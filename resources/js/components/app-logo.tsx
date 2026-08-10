import { usePage } from '@inertiajs/react';
import { useSidebar } from '@/components/ui/sidebar';

export default function AppLogo() {
    const { state } = useSidebar();
    const { tenant } = usePage().props as { tenant: { logo: string | null; name: string; features: string[] } | null };
    const features = tenant?.features ?? [];
    const useCustomBranding = features.includes('custom_branding');
    const logoSrc = useCustomBranding && tenant?.logo ? `/storage/${tenant.logo}` : '/logo.png';
    const appName = useCustomBranding && tenant?.name ? tenant.name : 'Amar Batch';

    return (
        <>
            <img src={logoSrc} alt={appName} className="h-8 w-8 shrink-0 rounded-md object-cover" />
            {state !== 'collapsed' && (
                <div className="grid flex-1 text-left text-sm">
                    <span className="truncate leading-tight font-semibold">
                        {appName}
                    </span>
                </div>
            )}
        </>
    );
}
