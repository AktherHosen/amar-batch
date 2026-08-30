import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
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
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem, NavItemGroup, NavItemSection } from '@/types';

function isSection(item: NavItem | NavItemSection): item is NavItemSection {
    return 'items' in item;
}

function ItemList({ items }: { items: NavItem[] }) {
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

function SectionList({ sections }: { sections: NavItemSection[] }) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    const initialOpen = useMemo(() => {
        const result: Record<string, boolean> = {};

        for (const s of sections) {
            if (s.items.some((item) => isCurrentOrParentUrl(item.href))) {
                result[s.title] = true;
            }
        }

        return result;
    }, [sections, isCurrentOrParentUrl]);

    const [openSections, setOpenSections] = useState<Record<string, boolean>>(initialOpen);

    return (
        <div className="flex flex-col gap-1">
            {sections.map((section) => {
                const anyActive = section.items.some((item) =>
                    isCurrentOrParentUrl(item.href),
                );

                return (
                    <Collapsible
                        key={section.title}
                        open={openSections[section.title] ?? anyActive}
                        onOpenChange={(open) =>
                            setOpenSections((prev) => ({
                                ...prev,
                                [section.title]: open,
                            }))
                        }
                        className="group/section"
                    >
                        <CollapsibleTrigger className="flex w-full cursor-pointer items-center gap-2 rounded-md p-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
                            {section.icon && <section.icon className="size-4 shrink-0" />}
                            <span>{section.title}</span>
                            <ChevronRight className="ml-auto size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/section:rotate-90" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="ml-4 border-l mt-1">
                            <ItemList items={section.items} />
                        </CollapsibleContent>
                    </Collapsible>
                );
            })}
        </div>
    );
}

function CollapsedItemList({ items }: { items: NavItem[] }) {
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

function CollapsedSectionIconList({ sections }: { sections: NavItemSection[] }) {
    const allItems = useMemo(() => {
        return sections.flatMap((s) =>
            s.items.map((item) => ({
                ...item,
                icon: item.icon ?? s.icon,
            })),
        );
    }, [sections]);

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
            {allItems.map((item) => (
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

export function NavMain({ groups }: { groups: NavItemGroup[] }) {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    return (
        <>
            {groups.map((group) => {
                const sections = group.items.filter((item): item is NavItemSection => isSection(item));
                const plainItems = group.items.filter((item): item is NavItem => !isSection(item));

                return (
                    <SidebarGroup key={group.label} className="px-2 py-0">
                        {!isCollapsed && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
                        <SidebarGroupContent>
                            {sections.length > 0 ? (
                                isCollapsed ? (
                                    <CollapsedSectionIconList sections={sections} />
                                ) : (
                                    <SectionList sections={sections} />
                                )
                            ) : isCollapsed ? (
                                <CollapsedItemList items={plainItems} />
                            ) : (
                                <ItemList items={plainItems} />
                            )}
                        </SidebarGroupContent>
                    </SidebarGroup>
                );
            })}
        </>
    );
}
