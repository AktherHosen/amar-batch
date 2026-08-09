import SuperAdminSidebarLayout from '@/layouts/super-admin/super-admin-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function SuperAdminLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <SuperAdminSidebarLayout breadcrumbs={breadcrumbs}>
            {children}
        </SuperAdminSidebarLayout>
    );
}
