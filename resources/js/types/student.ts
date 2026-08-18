export type Student = {
    id: number;
    name: string;
    phone: string | null;
    coaching_class_id: number | null;
    coaching_class: { id: number; name: string; default_fee: number } | null;
    section: string | null;
    address: string | null;
    date_of_birth: string | null;
    gender: 'male' | 'female' | 'other' | null;
    guardian_name: string | null;
    guardian_phone: string | null;
    photo: string | null;
    status: 'active' | 'inactive';
    joined_at: string | null;
    left_at: string | null;
    created_at: string;
    updated_at: string;
    enrollments?: Array<{
        id: number;
        batch: { id: number; name: string; subject: string | null };
        enrolled_at: string;
        status: string;
    }>;
    fee_statuses?: Array<{
        id: number;
        batch: { id: number; name: string };
        month: number;
        year: number;
        amount_paid: number;
        notes: string | null;
    }>;
    examResults?: Array<{
        id: number;
        exam: {
            id: number;
            title: string;
            subject: string;
            exam_date: string;
            total_marks: number;
            passing_marks: number;
            batch: { id: number; name: string } | null;
        };
        marks_obtained: number;
        notes: string | null;
    }>;
    batchHistories?: Array<{
        id: number;
        batch: { id: number; name: string } | null;
        user: { name: string } | null;
        action: string;
        action_date: string | null;
        notes: string | null;
        created_at: string;
    }>;
};
