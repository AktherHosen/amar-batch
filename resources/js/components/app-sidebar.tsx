import { Link } from '@inertiajs/react';
import { LayoutGrid, Users, Layers, GraduationCap, DollarSign, CheckSquare, School } from 'lucide-react';
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
import { useLocale } from '@/contexts/locale-context';
import { dashboard } from '@/routes';
import students from '@/routes/students';
import batches from '@/routes/batches';
import teachers from '@/routes/teachers';
import fees from '@/routes/fees';
import attendance from '@/routes/attendance';
import coachingClasses from '@/routes/coaching-classes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { t } = useLocale();
    
    const mainNavItems: NavItem[] = [
        {
            title: t('nav.dashboard'),
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: t('nav.students'),
            href: students.index(),
            icon: Users,
        },
        {
            title: t('nav.coaching_classes'),
            href: coachingClasses.index(),
            icon: School,
        },
        {
            title: t('nav.teachers'),
            href: teachers.index(),
            icon: GraduationCap,
        },
        {
            title: t('nav.batches'),
            href: batches.index(),
            icon: Layers,
        },
        {
            title: t('nav.fees'),
            href: fees.index(),
            icon: DollarSign,
        },
        {
            title: t('nav.attendance'),
            href: attendance.index(),
            icon: CheckSquare,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
