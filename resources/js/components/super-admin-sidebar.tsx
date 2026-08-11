import { Link } from '@inertiajs/react';
import { LayoutGrid, Building2, CreditCard } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItemGroup } from '@/types';

export function SuperAdminSidebar() {
    const groups: NavItemGroup[] = [
        {
            label: 'Platform',
            items: [
                { title: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutGrid },
                { title: 'Coaching Centers', href: '/super-admin/tenants', icon: Building2 },
                { title: 'Plans', href: '/super-admin/plans', icon: CreditCard },
                { title: 'Payments', href: '/super-admin/payments', icon: CreditCard },
            ],
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/super-admin/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={groups} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
