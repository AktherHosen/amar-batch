import { usePage } from '@inertiajs/react';

export function useFeatures(): string[] {
    const { tenant } = usePage().props as { tenant: { features: string[] } | null };

    return tenant?.features ?? [];
}

export function useHasFeature(feature: string): boolean {
    return useFeatures().includes(feature);
}
