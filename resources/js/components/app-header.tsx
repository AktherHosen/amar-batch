import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Menu,
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
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { NotificationBell } from '@/components/notification-bell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { isOwner } from '@/lib/role';
import { useHasFeature } from '@/lib/features';
import { useLocale } from '@/contexts/locale-context';
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
import type { BreadcrumbItem, NavItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const activeItemStyles =
    'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth } = page.props;
    const getInitials = useInitials();
    const { isCurrentUrl, whenCurrentUrl } = useCurrentUrl();
    const { t } = useLocale();
    const isUserOwner = isOwner(auth.user);
    const hasExams = useHasFeature('exams');
    const hasReports = useHasFeature('reports');
    const hasMultiBranch = useHasFeature('multi_branch');

    const allNavItems: NavItem[] = [
        { title: t('nav.dashboard'), href: dashboard(), icon: LayoutGrid },
        { title: t('nav.students'), href: students.index(), icon: Users },
        { title: t('nav.coaching_classes'), href: coachingClasses.index(), icon: School },
        { title: t('nav.teachers'), href: teachers.index(), icon: GraduationCap, ownerOnly: true },
        { title: t('nav.batches'), href: batches.index(), icon: Layers },
        { title: t('nav.fees'), href: fees.index(), icon: Wallet, ownerOnly: true },
        { title: t('nav.attendance'), href: attendance.index(), icon: CheckSquare },
        { title: t('nav.exams'), href: exams.index(), icon: FileText, featureRequired: 'exams' },
        { title: t('nav.reports'), href: reports.index(), icon: BarChart3, featureRequired: 'reports' },
        { title: t('nav.branches'), href: branches.index(), icon: Building2, featureRequired: 'multi_branch' },
        { title: t('nav.subscription'), href: subscription.index(), icon: CreditCard, ownerOnly: true },
    ];

    const mainNavItems = isUserOwner
        ? allNavItems.filter((item) => {
            if (item.ownerOnly && !isUserOwner) return false;
            if (item.featureRequired === 'exams' && !hasExams) return false;
            if (item.featureRequired === 'reports' && !hasReports) return false;
            if (item.featureRequired === 'multi_branch' && !hasMultiBranch) return false;
            return true;
        })
        : allNavItems.filter((item) => {
            if (item.ownerOnly) return false;
            if (item.featureRequired === 'exams' && !hasExams) return false;
            if (item.featureRequired === 'reports' && !hasReports) return false;
            if (item.featureRequired === 'multi_branch' && !hasMultiBranch) return false;
            return true;
        });

    return (
        <>
            <div className="border-b border-sidebar-border/80">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 h-[34px] w-[34px]"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar"
                            >
                                <SheetTitle className="sr-only">
                                    Navigation menu
                                </SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-1">
                                            {mainNavItems.map((item) => (
                                                <Link
                                                    key={item.title}
                                                    href={item.href}
                                                    className={cn(
                                                        'flex items-center space-x-2 rounded-md px-3 py-2 font-medium transition-colors hover:bg-sidebar-accent',
                                                        isCurrentUrl(item.href) && 'bg-sidebar-accent text-foreground',
                                                    )}
                                                >
                                                    {item.icon && (
                                                        <item.icon className="h-5 w-5" />
                                                    )}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={dashboard()}
                        prefetch
                        className="flex items-center space-x-2"
                    >
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem
                                        key={index}
                                        className="relative flex h-full items-center"
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                whenCurrentUrl(
                                                    item.href,
                                                    activeItemStyles,
                                                ),
                                                'h-9 cursor-pointer px-3',
                                            )}
                                        >
                                            {item.icon && (
                                                <item.icon className="mr-2 h-4 w-4" />
                                            )}
                                            {item.title}
                                        </Link>
                                        {isCurrentUrl(item.href) && (
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        <NotificationBell />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="size-10 rounded-full p-1"
                                >
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={auth.user?.avatar}
                                            alt={auth.user?.name}
                                        />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user?.name ?? '')}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                {auth.user && (
                                    <UserMenuContent user={auth.user} />
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
