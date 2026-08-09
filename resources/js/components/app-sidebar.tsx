import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Users,
    Layers,
    GraduationCap,
    DollarSign,
    CheckSquare,
    School,
    CreditCard,
} from 'lucide-react';
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
import { isOwner } from '@/lib/role';
import { dashboard } from '@/routes';
import students from '@/routes/students';
import batches from '@/routes/batches';
import teachers from '@/routes/teachers';
import fees from '@/routes/fees';
import attendance from '@/routes/attendance';
import coachingClasses from '@/routes/coaching-classes';
import subscription from '@/routes/subscription';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { t } = useLocale();
    const { auth } = usePage().props;
    const isUserOwner = isOwner(auth.user);

    const allNavItems: NavItem[] = [
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
            ownerOnly: true,
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
            ownerOnly: true,
        },
        {
            title: t('nav.attendance'),
            href: attendance.index(),
            icon: CheckSquare,
        },
        {
            title: t('nav.subscription'),
            href: subscription.index(),
            icon: CreditCard,
            ownerOnly: true,
        },
    ];

    const mainNavItems = isUserOwner
        ? allNavItems
        : allNavItems.filter((item) => !item.ownerOnly);

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
