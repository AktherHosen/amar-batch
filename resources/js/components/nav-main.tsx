import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useLocale } from '@/contexts/locale-context';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem, NavItemGroup } from '@/types';

function GroupItems({ items }: { items: NavItem[] }) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <motion.ul
            data-slot="sidebar-menu"
            data-sidebar="menu"
            initial="hidden"
            animate="visible"
            variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.03 } },
            }}
            className="flex w-full min-w-0 flex-col gap-1"
        >
            {items.map((item) => (
                <motion.li
                    key={item.title}
                    data-slot="sidebar-menu-item"
                    data-sidebar="menu-item"
                    className="group/menu-item relative"
                    variants={{
                        hidden: { opacity: 0, x: -12 },
                        visible: { opacity: 1, x: 0 },
                    }}
                >
                    <SidebarMenuButton
                        asChild
                        isActive={isCurrentOrParentUrl(item.href)}
                        tooltip={{ children: item.title }}
                    >
                        <Link href={item.href} prefetch>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                </motion.li>
            ))}
        </motion.ul>
    );
}

function GroupLabel({ label }: { label: string }) {
    return <SidebarGroupLabel>{label}</SidebarGroupLabel>;
}

export function NavMain({ groups }: { groups: NavItemGroup[] }) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { t } = useLocale();

    const activeLabel =
        groups.find((group) =>
            group.items.some((item) => isCurrentOrParentUrl(item.href)),
        )?.label ?? null;

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setOpenGroups(activeLabel ? { [activeLabel]: true } : {});
    }, [activeLabel]);

    return (
        <>
            {groups.map((group) => {
                const collapsible = group.collapsible !== false && group.label !== t('nav.group.main') && group.items.length >= 1;
                const anyActive = group.items.some((item) =>
                    isCurrentOrParentUrl(item.href),
                );

                if (!collapsible) {
                    return (
                        <SidebarGroup key={group.label} className="px-2 py-0">
                            <GroupLabel label={group.label} />
                            <SidebarGroupContent>
                                <GroupItems items={group.items} />
                            </SidebarGroupContent>
                        </SidebarGroup>
                    );
                }

                return (
                    <SidebarGroup key={group.label} className="px-2 py-0">
                        <Collapsible
                            open={openGroups[group.label] ?? anyActive}
                            onOpenChange={(open) =>
                                setOpenGroups((prev) => ({
                                    ...prev,
                                    [group.label]: open,
                                }))
                            }
                            className="group/collapsible"
                        >
                            <SidebarGroupLabel asChild>
                                <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs font-semibold text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
                                    <span>{group.label}</span>
                                    <ChevronRight className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </CollapsibleTrigger>
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                                <SidebarGroupContent>
                                    <GroupItems items={group.items} />
                                </SidebarGroupContent>
                            </CollapsibleContent>
                        </Collapsible>
                    </SidebarGroup>
                );
            })}
        </>
    );
}
