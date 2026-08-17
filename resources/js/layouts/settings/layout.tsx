import { router, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { isOwner } from '@/lib/role';
import { useHasFeature } from '@/lib/features';
import { toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import tenant from '@/routes/settings/tenant';
import api from '@/routes/settings/api';
import type { NavItem } from '@/types';

type SettingsTab = NavItem & {
    value: string;
};

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentUrl } = useCurrentUrl();
    const { auth } = usePage().props as {
        auth: { user: { role: string } | null };
    };
    const isUserOwner = isOwner(auth.user);
    const hasApiAccess = useHasFeature('api_access');

    const tabs: SettingsTab[] = [
        {
            value: toUrl(tenant.edit()),
            title: 'Coaching Center',
            href: tenant.edit(),
            ownerOnly: true,
        },
        {
            value: toUrl(edit()),
            title: 'Profile',
            href: edit(),
        },
        {
            value: toUrl(editSecurity()),
            title: 'Security',
            href: editSecurity(),
        },
        {
            value: toUrl(editAppearance()),
            title: 'Appearance',
            href: editAppearance(),
        },
        {
            value: toUrl(api.index()),
            title: 'API Access',
            href: api.index(),
            ownerOnly: true,
        },
    ];

    const visibleTabs = tabs.filter((tab) => {
        if (tab.ownerOnly && !isUserOwner) return false;
        if (tab.title === 'API Access' && !hasApiAccess) return false;

        return true;
    });

    const activeValue =
        visibleTabs.find((tab) => isCurrentUrl(tab.href))?.value ?? '';

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <Heading
                title="Settings"
                description="Manage your account preferences and options. Customize your experience to fit your needs. Configure notifications, security, and themes."
            />

            <Tabs
                value={activeValue}
                onValueChange={(value) => router.get(value)}
            >
                <TabsList className="h-9 w-full justify-start overflow-x-auto sm:w-fit">
                    {visibleTabs.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value}>
                            {tab.title}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <div className="max-w-2xl">{children}</div>
        </div>
    );
}
