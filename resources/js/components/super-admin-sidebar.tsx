import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Building2, CreditCard, Shield } from 'lucide-react';
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
import type { NavItem } from '@/types';

export function SuperAdminSidebar() {
    const navItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/super-admin/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Coaching Centers',
            href: '/super-admin/tenants',
            icon: Building2,
        },
        {
            title: 'Plans',
            href: '/super-admin/plans',
            icon: CreditCard,
        },
        {
            title: 'Payments',
            href: '/super-admin/payments',
            icon: CreditCard,
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
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
