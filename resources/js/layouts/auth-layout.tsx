import { usePage } from '@inertiajs/react';
import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';
import type { AppStats } from '@/types';

export default function AuthLayout({
    title = '',
    description = '',
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    const { appStats } = usePage().props as { appStats?: AppStats };

    return (
        <AuthLayoutTemplate title={title} description={description} stats={appStats}>
            {children}
        </AuthLayoutTemplate>
    );
}
