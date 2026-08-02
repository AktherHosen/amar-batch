import { Head, Link, router, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import teachers from '@/routes/teachers';
import batches from '@/routes/batches';

type PageProps = {
    auth: { user: { role: string } };
};

type Batch = {
    id: number;
    name: string;
    subject: string | null;
    enrollments_count: number;
    status: string;
};

type Teacher = {
    id: number;
    name: string;
    email: string;
    assigned_batches: Batch[];
    assigned_batches_count: number;
};

type TeachersShowProps = {
    teacher: Teacher;
};

export default function TeachersShow({ teacher }: TeachersShowProps) {
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';

    const handleDelete = () => {
        if (confirm(`Are you sure you want to deactivate ${teacher.name}?`)) {
            router.delete(teachers.destroy(teacher.id));
        }
    };

    return (
        <>
            <Head title={teacher.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={teachers.index()}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 size-4" />
                                Back
                            </Button>
                        </Link>
                        <Heading title={teacher.name} description="Teacher Details" />
                    </div>
                    {isAdmin && (
                        <div className="flex gap-2">
                            <Link href={teachers.edit(teacher.id)}>
                                <Button variant="outline">
                                    <Pencil className="mr-2 size-4" />
                                    Edit
                                </Button>
                            </Link>
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="mr-2 size-4" />
                                Deactivate
                            </Button>
                        </div>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Teacher Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{teacher.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{teacher.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Assigned Batches</p>
                            <p className="font-medium">{teacher.assigned_batches_count}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Assigned Batches</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {teacher.assigned_batches.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Students</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teacher.assigned_batches.map((batch) => (
                                        <TableRow key={batch.id}>
                                            <TableCell className="font-medium">{batch.name}</TableCell>
                                            <TableCell>{batch.subject || '-'}</TableCell>
                                            <TableCell>{batch.enrollments_count}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        batch.status === 'active'
                                                            ? 'default'
                                                            : batch.status === 'inactive'
                                                            ? 'secondary'
                                                            : 'destructive'
                                                    }
                                                >
                                                    {batch.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={batches.show(batch.id)}>
                                                    <Button variant="ghost" size="sm">
                                                        View
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-sm text-muted-foreground">No batches assigned yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

TeachersShow.layout = {
    breadcrumbs: [
        {
            title: 'Teachers',
            href: teachers.index(),
        },
        {
            title: 'View',
            href: '#',
        },
    ],
};
