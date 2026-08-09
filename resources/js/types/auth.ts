export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: 'super_admin' | 'owner' | 'staff' | 'student' | 'parent';
    tenant_id: number | null;
    phone?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type Tenant = {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    currency: string;
    timezone: string;
};

export type Plan = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price_monthly: number;
    price_yearly: number;
    max_students: number;
    max_staff: number;
    max_batches: number;
    features: string[];
    is_active: boolean;
    is_default: boolean;
    created_at: string;
    updated_at: string;
};

/* @chisel-passkeys */
export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
/* @end-chisel-passkeys */

/* @chisel-2fa */
export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
/* @end-chisel-2fa */
