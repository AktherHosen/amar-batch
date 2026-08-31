export function isOwner(user: { role: string } | null | undefined): boolean {
    return user?.role === 'owner' || user?.role === 'super_admin';
}

export function isStaff(user: { role: string } | null | undefined): boolean {
    return user?.role === 'staff';
}

export function isSuperAdmin(user: { role: string } | null | undefined): boolean {
    return user?.role === 'super_admin';
}

export function isParent(user: { role: string } | null | undefined): boolean {
    return user?.role === 'parent';
}
