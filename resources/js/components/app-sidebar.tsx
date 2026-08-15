import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Users,
    Layers,
    GraduationCap,
Wallet,
    CheckSquare,
    School,
    CreditCard,
    FileText,
    BarChart3,
    Building2,
    Megaphone,
    Calendar,
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
import { useHasFeature } from '@/lib/features';
import { dashboard } from '@/routes';
import students from '@/routes/students';
import batches from '@/routes/batches';
import teachers from '@/routes/teachers';
import fees from '@/routes/fees';
import attendance from '@/routes/attendance';
import coachingClasses from '@/routes/coaching-classes';
import exams from '@/routes/exams';
import reports from '@/routes/reports';
import branches from '@/routes/branches';
import subscription from '@/routes/subscription';
import type { NavItem, NavItemGroup } from '@/types';

export function AppSidebar() {
    const { t } = useLocale();
    const { auth } = usePage().props;
    const isUserOwner = isOwner(auth.user);
    const hasExams = useHasFeature('exams');
    const hasReports = useHasFeature('reports');
    const hasMultiBranch = useHasFeature('multi_branch');

    const filterItem = (item: NavItem): boolean => {
        if (item.ownerOnly && !isUserOwner) return false;
        if (item.featureRequired === 'exams' && !hasExams) return false;
        if (item.featureRequired === 'reports' && !hasReports) return false;
        if (item.featureRequired === 'multi_branch' && !hasMultiBranch) return false;
        return true;
    };

    const groups: NavItemGroup[] = [
        {
            label: 'Overview',
            items: [
                { title: t('nav.dashboard'), href: dashboard(), icon: LayoutGrid },
            ],
        },
        {
            label: 'Academic',
            items: [
                { title: t('nav.students'), href: students.index(), icon: Users },
                { title: t('nav.coaching_classes'), href: coachingClasses.index(), icon: School },
                { title: t('nav.teachers'), href: teachers.index(), icon: GraduationCap, ownerOnly: true },
                { title: t('nav.batches'), href: batches.index(), icon: Layers },
            ],
        },
        {
            label: 'Finance',
            items: [
                { title: t('nav.fees'), href: fees.index(), icon: Wallet, ownerOnly: true },
                { title: t('nav.subscription'), href: subscription.index(), icon: CreditCard, ownerOnly: true },
            ],
        },
        {
            label: 'Tracking',
            items: [
                { title: t('nav.attendance'), href: attendance.index(), icon: CheckSquare },
                { title: t('nav.exams'), href: exams.index(), icon: FileText, featureRequired: 'exams' },
            ],
        },
        {
            label: 'Communication',
            items: [
                { title: 'Notices', href: '/notices', icon: Megaphone },
                { title: 'Holidays', href: '/holidays', icon: Calendar },
            ],
        },
        {
            label: 'Insights',
            items: [
                { title: t('nav.reports'), href: reports.index(), icon: BarChart3, featureRequired: 'reports' },
                { title: t('nav.branches'), href: branches.index(), icon: Building2, featureRequired: 'multi_branch' },
            ],
        },
    ];

    const filteredGroups = groups
        .map((group) => ({
            ...group,
            items: group.items.filter(filterItem),
        }))
        .filter((group) => group.items.length > 0);

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
                <NavMain groups={filteredGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
