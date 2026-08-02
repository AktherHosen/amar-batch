export type Student = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    class_name: string | null;
    section: string | null;
    address: string | null;
    date_of_birth: string | null;
    gender: 'male' | 'female' | 'other' | null;
    guardian_name: string | null;
    guardian_phone: string | null;
    photo: string | null;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
};
