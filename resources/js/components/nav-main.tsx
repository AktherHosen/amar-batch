import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem, NavItemGroup } from '@/types';

export function NavMain({ groups }: { groups: NavItemGroup[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <>
            {groups.map((group) => (
                <SidebarGroup key={group.label} className="px-2 py-0">
                    <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                    <SidebarMenu>
                        <motion.ul
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: {},
                                visible: { transition: { staggerChildren: 0.03 } },
                            }}
                            className="space-y-0.5"
                        >
                            {group.items.map((item) => (
                                <Collapsible key={item.title} asChild defaultOpen={isCurrentUrl(item.href)}>
                                    <motion.li
                                        variants={{
                                            hidden: { opacity: 0, x: -12 },
                                            visible: { opacity: 1, x: 0 },
                                        }}
                                    >
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isCurrentUrl(item.href)}
                                                tooltip={{ children: item.title }}
                                            >
                                                <Link href={item.href} prefetch>
                                                    {item.icon && <item.icon />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </motion.li>
                                </Collapsible>
                            ))}
                        </motion.ul>
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
