import { router, usePage } from '@inertiajs/react';
import { Building2, Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { UserTenant } from '@/types';

export function TenantSwitcher() {
    const { auth } = usePage().props as {
        auth: { user: { tenants?: UserTenant[]; activeTenantId?: number | null } };
    };

    const tenants = auth.user?.tenants ?? [];
    const activeTenantId = auth.user?.activeTenantId;
    const [open, setOpen] = useState(false);

    // Don't render if user has 0 or 1 tenant
    if (tenants.length <= 1) {
        return null;
    }

    const activeTenant = tenants.find((t) => t.id === activeTenantId) ?? tenants[0];

    const handleSwitch = (tenantId: number) => {
        router.post(
            `/switch-tenant/${tenantId}`,
            {},
            {
                onFinish: () => setOpen(false),
            },
        );
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 px-2"
                >
                    <Building2 className="size-4 shrink-0" />
                    <span className="truncate text-sm font-medium">
                        {activeTenant?.name}
                    </span>
                    <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Switch Coaching Center</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {tenants.map((tenant) => (
                    <DropdownMenuItem
                        key={tenant.id}
                        onClick={() => handleSwitch(tenant.id)}
                        className="cursor-pointer"
                    >
                        <Building2 className="mr-2 size-4" />
                        <span className="flex-1 truncate">{tenant.name}</span>
                        {tenant.id === activeTenantId && (
                            <Check className="ml-2 size-4" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
