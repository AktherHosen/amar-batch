import { Head, router, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import branches from '@/routes/branches';
import { useLocale } from '@/contexts/locale-context';

type Branch = {
    id: number;
    name: string;
    code: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    is_active: boolean;
    batches_count: number;
    students_count: number;
};

type PageProps = { branch: Branch };

export default function BranchesShow({ branch }: PageProps) {
    const { t } = useLocale();

    return (
        <>
            <Head title={branch.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={branches.index()}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 size-4" />
                            {t('actions.back')}
                        </Button>
                    </Link>
                    <Heading title={branch.name} description={branch.code || ''} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">{t('branches.status')}</div>
                            <Badge className={branch.is_active ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                                {branch.is_active ? t('branches.active') : t('branches.inactive')}
                            </Badge>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">{t('branches.batches')}</div>
                            <div className="text-2xl font-bold">{branch.batches_count}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">{t('branches.students')}</div>
                            <div className="text-2xl font-bold">{branch.students_count}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">{t('branches.phone')}</div>
                            <div className="text-lg font-semibold">{branch.phone || '-'}</div>
                        </CardContent>
                    </Card>
                </div>

                {branch.address && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">{t('branches.address')}</div>
                            <div>{branch.address}</div>
                        </CardContent>
                    </Card>
                )}

                {branch.email && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">{t('branches.email')}</div>
                            <div>{branch.email}</div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

BranchesShow.layout = {
    breadcrumbs: [
        { title: 'Branches', href: branches.index() },
        { title: 'Detail', href: '' },
    ],
};
