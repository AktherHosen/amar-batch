import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, PenLine, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-context';
import { isOwner } from '@/lib/role';
import branches from '@/routes/branches';

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

type PageProps = {
    auth: { user: { role: string } };
    branch: Branch;
};

export default function BranchesShow({ branch }: PageProps) {
    const { t } = useLocale();
    const { auth } = usePage<PageProps>().props;
    const isAdmin = isOwner(auth.user);
    const [deleteDialog, setDeleteDialog] = useState(false);

    const handleDelete = () => {
        setDeleteDialog(true);
    };

    const confirmDelete = () => {
        router.delete(branches.destroy(branch.id), {
            onSuccess: () => toast.success(t('toast.deleted_successfully')),
        });
        setDeleteDialog(false);
    };

    return (
        <>
            <Head title={branch.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex min-w-0 items-center justify-between">
                    <div className="flex min-w-0 items-center gap-2">
                        <Link href={branches.index()} className="shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-9"
                            >
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <h1 className="truncate text-lg font-bold tracking-tight sm:text-2xl">
                            {branch.name}
                        </h1>
                    </div>
                    {isAdmin && (
                        <div className="flex shrink-0 gap-2">
                            <Link href={branches.edit(branch.id)}>
                                <Button variant="outline" className="h-9">
                                    <PenLine className="size-4" />
                                    <span className="ml-2 hidden sm:inline">{t('actions.edit')}</span>
                                </Button>
                            </Link>
                            <Button
                                variant="destructive"
                                className="h-9"
                                onClick={handleDelete}
                            >
                                <Trash2 className="size-4" />
                                <span className="ml-2 hidden sm:inline">{t('actions.delete')}</span>
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('branches.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('branches.name')}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {branch.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('branches.code')}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {branch.code || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('branches.status')}
                                    </p>
                                    <Badge
                                        className={
                                            branch.is_active
                                                ? 'bg-green-600 text-white'
                                                : 'bg-red-600 text-white'
                                        }
                                    >
                                        {branch.is_active
                                            ? t('branches.active')
                                            : t('branches.inactive')}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('branches.batches')}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {branch.batches_count}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('branches.students')}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {branch.students_count}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('branches.contact')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('branches.phone')}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {branch.phone || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('branches.email')}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {branch.email || '-'}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-muted-foreground">
                                        {t('branches.address')}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {branch.address || '-'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ConfirmDialog
                open={deleteDialog}
                onOpenChange={setDeleteDialog}
                title={t('branches.delete_title')}
                description={t('branches.delete_confirm').replace(
                    '{name}',
                    branch.name,
                )}
                confirmText={t('actions.delete')}
                cancelText={t('actions.cancel')}
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

BranchesShow.layout = {
    breadcrumbs: [
        { title: 'Branches', href: branches.index() },
        { title: 'Detail', href: '' },
    ],
};
