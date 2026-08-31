import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Users,
    UsersRound,
    Layers,
    CheckSquare,
    BarChart3,
    Megaphone,
    User,
    Settings,
    Crown,
    Receipt,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { TenantSwitcher } from '@/components/tenant-switcher';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import { useLocale } from '@/contexts/locale-context';
import { useHasFeature } from '@/lib/features';
import { usePermissions } from '@/lib/permissions';
import { isOwner } from '@/lib/role';
import { isSuperAdmin } from '@/lib/role';
import { dashboard } from '@/routes';
import { edit as appearanceEdit } from '@/routes/appearance';
import attendance from '@/routes/attendance';
import batches from '@/routes/batches';
import branches from '@/routes/branches';
import coachingClasses from '@/routes/coaching-classes';
import exams from '@/routes/exams';
import fees from '@/routes/fees';
import { edit as profileEdit } from '@/routes/profile';
import reports from '@/routes/reports';
import roles from '@/routes/roles';
import { edit as securityEdit } from '@/routes/security';
import api from '@/routes/settings/api';
import tenant from '@/routes/settings/tenant';
import students from '@/routes/students';
import subscription from '@/routes/subscription';
import teachers from '@/routes/teachers';
import users from '@/routes/users';
import type { NavItem, NavItemGroup, NavItemSection } from '@/types';

export function AppSidebar() {
    const { t } = useLocale();
    const { auth } = usePage().props;
    const isUserOwner = isOwner(auth.user);
    const isUserSuperAdmin = isSuperAdmin(auth.user);
    const hasExams = useHasFeature('exams');
    const hasReports = useHasFeature('reports');
    const hasMultiBranch = useHasFeature('multi_branch');
    const hasApiAccess = useHasFeature('api_access');
    const permissions = usePermissions();

    const hasPermission = (route: string): boolean => {
        if (permissions.includes('*')) {
return true;
}

        return permissions.some((pattern) => {
            const escaped = pattern
                .split('*')
                .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
                .join('.*');

            return new RegExp(`^${escaped}$`).test(route);
        });
    };

    const filterItem = (item: NavItem): boolean => {
        if (isUserSuperAdmin) {
            return !!item.superAdminOnly || (!item.ownerOnly && !item.featureRequired && !item.permission);
        }

        if (item.superAdminOnly) {
            return false;
        }

        if (item.ownerOnly && !isUserOwner) {
            return false;
        }

        if (item.featureRequired === 'exams' && !hasExams) {
return false;
}

        if (item.featureRequired === 'reports' && !hasReports) {
return false;
}

        if (item.featureRequired === 'multi_branch' && !hasMultiBranch) {
return false;
}

        if (item.featureRequired === 'api_access' && !hasApiAccess) {
return false;
}

        if (item.permission && !hasPermission(item.permission)) {
return false;
}

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
            label: 'Super Admin',
            collapsible: false,
            items: [
                {
                    title: 'Admin',
                    icon: Crown,
                    items: [
                        {
                            title: 'Overview',
                            href: '/dashboard/overview',
                            superAdminOnly: true,
                        },
                        {
                            title: 'Owners',
                            href: '/dashboard/owners',
                            superAdminOnly: true,
                        },
                        {
                            title: 'Plans',
                            href: '/dashboard/plans',
                            superAdminOnly: true,
                        },
                        {
                            title: 'Payments',
                            href: '/dashboard/payments',
                            superAdminOnly: true,
                        },
                        {
                            title: 'Messages',
                            href: '/dashboard/contacts',
                            superAdminOnly: true,
                        },
                    ],
                } as NavItemSection,
            ],
        },
        {
            label: t('nav.group.administration'),
            items: [
                {
                    title: 'Users & Roles',
                    icon: UsersRound,
                    items: [
                        {
                            title: t('nav.users'),
                            href: users.index(),
                            permission: 'users.index',
                        },
                        {
                            title: t('nav.roles'),
                            href: roles.index(),
                            ownerOnly: true,
                        },
                    ],
                } as NavItemSection,
            ],
        },
        {
            label: t('nav.group.academic'),
            items: [
                {
                    title: 'People',
                    icon: Users,
                    items: [
                        {
                            title: t('nav.students'),
                            href: students.index(),
                            permission: 'students.index',
                        },
                        {
                            title: t('nav.teachers'),
                            href: teachers.index(),
                            permission: 'teachers.index',
                        },
                    ],
                } as NavItemSection,
                {
                    title: 'Structure',
                    icon: Layers,
                    items: [
                        {
                            title: t('nav.coaching_classes'),
                            href: coachingClasses.index(),
                            permission: 'coaching-classes.index',
                        },
                        {
                            title: t('nav.batches'),
                            href: batches.index(),
                            permission: 'batches.index',
                        },
                    ],
                } as NavItemSection,
            ],
        },
        {
            label: t('nav.group.finance'),
            items: [
                {
                    title: 'Billing',
                    icon: Receipt,
                    items: [
                        {
                            title: t('nav.fees'),
                            href: fees.index(),
                            ownerOnly: true,
                            permission: 'fees.index',
                        },
                        {
                            title: t('nav.receipts'),
                            href: '/fees/receipts',
                            ownerOnly: true,
                        },
                    ],
                } as NavItemSection,
            ],
        },
        {
            label: t('nav.group.tracking'),
            items: [
                {
                    title: 'Daily',
                    icon: CheckSquare,
                    items: [
                        {
                            title: t('nav.attendance'),
                            href: attendance.index(),
                            permission: 'attendance.index',
                        },
                        {
                            title: t('nav.exams'),
                            href: exams.index(),
                            featureRequired: 'exams',
                            permission: 'exams.index',
                        },
                    ],
                } as NavItemSection,
            ],
        },
        {
            label: t('nav.group.communication'),
            items: [
                {
                    title: 'Announcements',
                    icon: Megaphone,
                    items: [
                        {
                            title: 'Notices',
                            href: '/notices',
                            permission: 'notices.index',
                        },
                        {
                            title: 'Holidays',
                            href: '/holidays',
                            permission: 'holidays.index',
                        },
                    ],
                } as NavItemSection,
            ],
        },
        {
            label: t('nav.group.insights'),
            items: [
                {
                    title: 'Analytics',
                    icon: BarChart3,
                    items: [
                        {
                            title: t('nav.reports'),
                            href: reports.index(),
                            featureRequired: 'reports',
                            permission: 'reports.index',
                        },
                        {
                            title: t('nav.branches'),
                            href: branches.index(),
                            featureRequired: 'multi_branch',
                            permission: 'branches.index',
                        },
                    ],
                } as NavItemSection,
            ],
        },
        {
            label: t('nav.group.settings'),
            items: [
                {
                    title: 'General',
                    icon: Settings,
                    items: [
                        {
                            title: t('nav.coaching_center'),
                            href: tenant.edit(),
                            ownerOnly: true,
                        },
                        {
                            title: t('nav.appearance'),
                            href: appearanceEdit(),
                        },
                    ],
                } as NavItemSection,
                {
                    title: 'Account',
                    icon: User,
                    items: [
                        {
                            title: t('nav.profile'),
                            href: profileEdit(),
                        },
                        {
                            title: t('nav.security'),
                            href: securityEdit(),
                        },
                        {
                            title: t('nav.api_access'),
                            href: api.index(),
                            ownerOnly: true,
                            featureRequired: 'api_access',
                        },
                    ],
                } as NavItemSection,
            ],
        },
    ];

    const filteredGroups = groups
        .map((group) => ({
            ...group,
            items: group.items
                .map((item) => {
                    if ('items' in item) {
                        const filteredItems = item.items.filter(filterItem);

                        return filteredItems.length > 0 ? { ...item, items: filteredItems } : null;
                    }

                    return filterItem(item) ? item : null;
                })
                .filter(Boolean),
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
                    <SidebarMenuItem>
                        <TenantSwitcher />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={filteredGroups} />
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href={subscription.index()} prefetch>
                                <Crown className="size-4" />
                                <span>{t('nav.upgrade') ?? 'Upgrade'}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            {isUserSuperAdmin && <SidebarRail />}
        </Sidebar>
    );
}
