import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import { LocaleProvider } from '@/contexts/locale-context';
import '@/i18n';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import SuperAdminLayout from '@/layouts/super-admin-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Amar Batch';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
            case name === 'docs':
            case name === 'contact':
            case name === 'terms':
            case name === 'privacy':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('super-admin/'):
                return SuperAdminLayout;
            case name === 'settings/tenant':
                return AppLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <LocaleProvider>
                <TooltipProvider delayDuration={0}>
                    {app}
                    <Toaster />
                </TooltipProvider>
            </LocaleProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
