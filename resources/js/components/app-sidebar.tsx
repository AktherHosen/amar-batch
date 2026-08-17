import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Users,
    UsersRound,
    Layers,
    Wallet,
    CheckSquare,
    School,
    GraduationCap,
    CreditCard,
    FileText,
    BarChart3,
    Building2,
    Megaphone,
    Calendar,
    Shield,
    User,
    Palette,
    Key,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import { useLocale } from '@/contexts/locale-context';
import { isOwner } from '@/lib/role';
import { useHasFeature } from '@/lib/features';
import { usePermissions } from '@/lib/permissions';
import { dashboard } from '@/routes';
import students from '@/routes/students';
import batches from '@/routes/batches';
import teachers from '@/routes/teachers';
import users from '@/routes/users';
import fees from '@/routes/fees';
import attendance from '@/routes/attendance';
import coachingClasses from '@/routes/coaching-classes';
import exams from '@/routes/exams';
import reports from '@/routes/reports';
import branches from '@/routes/branches';
import subscription from '@/routes/subscription';
import roles from '@/routes/roles';
import settings from '@/routes/settings';
import { edit as profileEdit } from '@/routes/profile';
import { edit as securityEdit } from '@/routes/security';
import { edit as appearanceEdit } from '@/routes/appearance';
import apiSettings from '@/routes/settings/api';
import type { NavItem, NavItemGroup } from '@/types';

export function AppSidebar() {
    const { t } = useLocale();
    const { auth } = usePage().props;
    const isUserOwner = isOwner(auth.user);
    const hasExams = useHasFeature('exams');
    const hasReports = useHasFeature('reports');
    const hasMultiBranch = useHasFeature('multi_branch');
    const hasApiAccess = useHasFeature('api_access');
    const permissions = usePermissions();

    const hasPermission = (route: string): boolean => {
        if (permissions.includes('*')) return true;
        return permissions.some((pattern) => {
            const escaped = pattern
                .split('*')
                .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
                .join('.*');
            return new RegExp(`^${escaped}$`).test(route);
        });
    };

    const filterItem = (item: NavItem): boolean => {
        if (item.ownerOnly && !isUserOwner) return false;
        if (item.featureRequired === 'exams' && !hasExams) return false;
        if (item.featureRequired === 'reports' && !hasReports) return false;
        if (item.featureRequired === 'multi_branch' && !hasMultiBranch)
            return false;
        if (item.featureRequired === 'api_access' && !hasApiAccess)
            return false;
        if (item.permission && !hasPermission(item.permission)) return false;
        return true;
    };

    const groups: NavItemGroup[] = [
        {
            label: t('nav.group.main'),
            items: [
                {
                    title: t('nav.dashboard'),
                    href: dashboard(),
                    icon: LayoutGrid,
                },
            ],
        },
        {
            label: t('nav.group.administration'),
            items: [
                {
                    title: t('nav.users'),
                    href: users.index(),
                    icon: UsersRound,
                    permission: 'users.index',
                },
                {
                    title: t('nav.roles'),
                    href: roles.index(),
                    icon: Shield,
                    ownerOnly: true,
                },
            ],
        },
        {
            label: t('nav.group.academic'),
            items: [
                {
                    title: t('nav.students'),
                    href: students.index(),
                    icon: Users,
                    permission: 'students.index',
                },
                {
                    title: t('nav.coaching_classes'),
                    href: coachingClasses.index(),
                    icon: School,
                    permission: 'coaching-classes.index',
                },
                {
                    title: t('nav.teachers'),
                    href: teachers.index(),
                    icon: GraduationCap,
                    permission: 'teachers.index',
                },
                {
                    title: t('nav.batches'),
                    href: batches.index(),
                    icon: Layers,
                    permission: 'batches.index',
                },
            ],
        },
        {
            label: t('nav.group.finance'),
            items: [
                {
                    title: t('nav.fees'),
                    href: fees.index(),
                    icon: Wallet,
                    ownerOnly: true,
                    permission: 'fees.index',
                },
                {
                    title: t('nav.subscription'),
                    href: subscription.index(),
                    icon: CreditCard,
                    ownerOnly: true,
                },
            ],
        },
        {
            label: t('nav.group.tracking'),
            items: [
                {
                    title: t('nav.attendance'),
                    href: attendance.index(),
                    icon: CheckSquare,
                    permission: 'attendance.index',
                },
                {
                    title: t('nav.exams'),
                    href: exams.index(),
                    icon: FileText,
                    featureRequired: 'exams',
                    permission: 'exams.index',
                },
            ],
        },
        {
            label: t('nav.group.communication'),
            items: [
                {
                    title: 'Notices',
                    href: '/notices',
                    icon: Megaphone,
                    permission: 'notices.index',
                },
                {
                    title: 'Holidays',
                    href: '/holidays',
                    icon: Calendar,
                    permission: 'holidays.index',
                },
            ],
        },
        {
            label: t('nav.group.insights'),
            items: [
                {
                    title: t('nav.reports'),
                    href: reports.index(),
                    icon: BarChart3,
                    featureRequired: 'reports',
                    permission: 'reports.index',
                },
                {
                    title: t('nav.branches'),
                    href: branches.index(),
                    icon: Building2,
                    featureRequired: 'multi_branch',
                    permission: 'branches.index',
                },
            ],
        },
        {
            label: t('nav.group.settings'),
            items: [
                {
                    title: t('nav.profile'),
                    href: profileEdit(),
                    icon: User,
                },
                {
                    title: t('nav.security'),
                    href: securityEdit(),
                    icon: Shield,
                },
                {
                    title: t('nav.appearance'),
                    href: appearanceEdit(),
                    icon: Palette,
                },
                {
                    title: t('nav.coaching_center'),
                    href: settings.tenant.edit(),
                    icon: Building2,
                    ownerOnly: true,
                    permission: 'settings.tenant.edit',
                },
                {
                    title: t('nav.api_access'),
                    href: apiSettings.index(),
                    icon: Key,
                    ownerOnly: true,
                    featureRequired: 'api_access',
                },
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

            <SidebarRail />
        </Sidebar>
    );
}
