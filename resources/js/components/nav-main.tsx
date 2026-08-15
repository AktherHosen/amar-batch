import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem, NavItemGroup } from '@/types';

export function NavMain({ groups }: { groups: NavItemGroup[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <>
            {groups.map((group) => {
                const anyActive = group.items.some((item) =>
                    isCurrentUrl(item.href),
                );

                return (
                    <SidebarGroup
                        key={group.label}
                        className="px-2 py-0"
                    >
                        <Collapsible
                            defaultOpen={anyActive}
                            className="group/collapsible"
                        >
                            <SidebarGroupLabel asChild>
                                <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs font-semibold text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
                                    <span>{group.label}</span>
                                    <ChevronRight className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </CollapsibleTrigger>
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        <motion.ul
                                            initial="hidden"
                                            animate="visible"
                                            variants={{
                                                hidden: {},
                                                visible: {
                                                    transition: {
                                                        staggerChildren: 0.03,
                                                    },
                                                },
                                            }}
                                            className="space-y-0.5"
                                        >
                                            {group.items.map((item) => (
                                                <motion.li
                                                    key={item.title}
                                                    variants={{
                                                        hidden: {
                                                            opacity: 0,
                                                            x: -12,
                                                        },
                                                        visible: {
                                                            opacity: 1,
                                                            x: 0,
                                                        },
                                                    }}
                                                >
                                                    <SidebarMenuItem>
                                                        <SidebarMenuButton
                                                            asChild
                                                            isActive={isCurrentUrl(
                                                                item.href,
                                                            )}
                                                            tooltip={{
                                                                children:
                                                                    item.title,
                                                            }}
                                                        >
                                                            <Link
                                                                href={item.href}
                                                                prefetch
                                                            >
                                                                {item.icon && (
                                                                    <item.icon />
                                                                )}
                                                                <span>
                                                                    {item.title}
                                                                </span>
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuItem>
                                                </motion.li>
                                            ))}
                                        </motion.ul>
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </CollapsibleContent>
                        </Collapsible>
                    </SidebarGroup>
                );
            })}
        </>
    );
}