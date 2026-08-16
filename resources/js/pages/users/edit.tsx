import { Head, router, Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Heading from '@/components/heading';
import UserForm from '@/components/user-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import users from '@/routes/users';
import { useLocale } from '@/contexts/locale-context';

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
};

type Role = {
    id: number;
    name: string;
    slug: string;
};

type UsersEditProps = {
    user: User;
    roles?: Role[];
};

export default function UsersEdit({ user, roles = [] }: UsersEditProps) {
    const { t } = useLocale();
    const { errors } = usePage().props;
    const handleSubmit = (data: FormData) => {
        data.append('_method', 'PUT');
        router.post(users.update(user.id), data, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`${t('actions.edit')} ${user.name}`} />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
            >
                <div className="flex items-center gap-4 min-w-0">
                    <Link href={users.show(user.id)} className="shrink-0">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div className="min-w-0">
                        <Heading
                            title={`${t('actions.edit')} ${user.name}`}
                        />
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <UserForm
                            user={user}
                            roles={roles}
                            onSubmit={handleSubmit}
                            processing={false}
                            errors={errors}
                        />
                    </CardContent>
                </Card>
            </motion.div>
        </>
    );
}

UsersEdit.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: users.index(),
        },
        {
            title: 'Edit',
            href: '#',
        },
    ],
};