import { Link, router } from '@inertiajs/react';
import { Building2, LogOut } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { UserTenant } from '@/types';

type PageProps = {
    tenants: (UserTenant & { is_active: boolean })[];
};

export default function SelectTenant({ tenants }: PageProps) {
    const handleSelect = (tenantId: number) => {
        router.post(`/switch-tenant/${tenantId}`);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
            <div className="w-full max-w-md">
                <div className="mb-8 flex flex-col items-center gap-3">
                    <AppLogo />
                    <h1 className="text-2xl font-bold">Select Coaching Center</h1>
                    <p className="text-center text-sm text-muted-foreground">
                        You belong to multiple coaching centers. Select one to
                        continue.
                    </p>
                </div>

                <div className="space-y-3">
                    {tenants.map((tenant) => (
                        <Card
                            key={tenant.id}
                            className={`cursor-pointer transition-colors hover:border-primary ${
                                !tenant.is_active ? 'opacity-50' : ''
                            }`}
                            onClick={() =>
                                tenant.is_active && handleSelect(tenant.id)
                            }
                        >
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Building2 className="size-5 text-primary" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate font-medium">
                                        {tenant.name}
                                    </p>
                                    <p className="text-sm capitalize text-muted-foreground">
                                        {tenant.role || 'member'}
                                    </p>
                                </div>
                                {!tenant.is_active && (
                                    <span className="text-xs text-destructive">
                                        Inactive
                                    </span>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-8 flex justify-center">
                    <Link
                        href="/logout"
                        as="button"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <LogOut className="size-4" />
                        Log out
                    </Link>
                </div>
            </div>
        </div>
    );
}
