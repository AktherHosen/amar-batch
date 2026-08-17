import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { isOwner } from '@/lib/role';
import { useHasFeature } from '@/lib/features';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import tenant from '@/routes/settings/tenant';
import api from '@/routes/settings/api';
import type { NavItem } from '@/types';
import { Building2, Key, Palette, Shield, User } from 'lucide-react';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { auth } = usePage().props as {
        auth: { user: { role: string } | null };
    };
    const isUserOwner = isOwner(auth.user);
    const hasApiAccess = useHasFeature('api_access');

    const sidebarNavItems: NavItem[] = [
        {
            title: 'Profile',
            href: edit(),
            icon: User,
        },
        {
            title: 'Security',
            href: editSecurity(),
            icon: Shield,
        },
        {
            title: 'Appearance',
            href: editAppearance(),
            icon: Palette,
        },
        {
            title: 'Coaching Center',
            href: tenant.edit(),
            icon: Building2,
            ownerOnly: true,
        },
        {
            title: 'API Access',
            href: api.index(),
            icon: Key,
            ownerOnly: true,
        },
    ];

    const visibleNavItems = sidebarNavItems.filter((item) => {
        if (item.ownerOnly && !isUserOwner) return false;
        if (item.title === 'API Access' && !hasApiAccess) return false;

        return true;
    });

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav
                        className="flex flex-col space-y-1 space-x-0"
                        aria-label="Settings"
                    >
                        {visibleNavItems.map((item, index) => (
                            <Button
                                key={`${toUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isCurrentOrParentUrl(item.href),
                                })}
                            >
                                <Link href={item.href}>
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-6">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}