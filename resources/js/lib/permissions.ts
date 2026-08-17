import { usePage } from '@inertiajs/react';

export function usePermissions(): string[] {
    const { auth } = usePage().props as {
        auth: { user: { permissions?: string[] } | null };
    };
    return auth.user?.permissions ?? [];
}

export function useHasPermission(route: string): boolean {
    const permissions = usePermissions();

    if (permissions.includes('*')) {
        return true;
    }

    return permissions.some((pattern) => globMatch(pattern, route));
}

function globMatch(pattern: string, value: string): boolean {
    const escaped = pattern
        .split('*')
        .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
        .join('.*');

    return new RegExp(`^${escaped}$`).test(value);
}