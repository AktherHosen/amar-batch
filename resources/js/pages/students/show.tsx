import { Head, Link, router, usePage } from '@inertiajs/react';
import { type Student } from '@/types';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import students from '@/routes/students';

type PageProps = {
    auth: { user: { role: string } };
};

type StudentsShowProps = {
    student: Student;
};

export default function StudentsShow({ student }: StudentsShowProps) {
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${student.name}?`)) {
            router.delete(students.destroy(student.id));
        }
    };

    return (
        <>
            <Head title={student.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={students.index()}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 size-4" />
                                Back
                            </Button>
                        </Link>
                        <Heading title={student.name} description="Student Details" />
                    </div>
                    {isAdmin && (
                        <div className="flex gap-2">
                            <Link href={students.edit(student.id)}>
                                <Button variant="outline">
                                    <Pencil className="mr-2 size-4" />
                                    Edit
                                </Button>
                            </Link>
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="mr-2 size-4" />
                                Delete
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{student.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{student.email || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p className="font-medium">{student.phone || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Date of Birth</p>
                                <p className="font-medium">
                                    {student.date_of_birth
                                        ? new Date(student.date_of_birth).toLocaleDateString()
                                        : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Gender</p>
                                <p className="font-medium capitalize">{student.gender || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                                    {student.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Guardian & Address</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Address</p>
                                <p className="font-medium">{student.address || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Guardian Name</p>
                                <p className="font-medium">{student.guardian_name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Guardian Phone</p>
                                <p className="font-medium">{student.guardian_phone || '-'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {student.enrollments && student.enrollments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Enrollments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Batch</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Enrolled At</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {student.enrollments.map((enrollment) => (
                                        <TableRow key={enrollment.id}>
                                            <TableCell className="font-medium">{enrollment.batch?.name}</TableCell>
                                            <TableCell>{enrollment.batch?.subject || '-'}</TableCell>
                                            <TableCell>
                                                {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        enrollment.status === 'active'
                                                            ? 'default'
                                                            : enrollment.status === 'completed'
                                                            ? 'secondary'
                                                            : 'destructive'
                                                    }
                                                >
                                                    {enrollment.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {student.feeStatuses && student.feeStatuses.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Fee Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Batch</TableHead>
                                        <TableHead>Amount Paid</TableHead>
                                        <TableHead>Amount Due</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {student.feeStatuses.map((fee) => (
                                        <TableRow key={fee.id}>
                                            <TableCell className="font-medium">{fee.batch?.name}</TableCell>
                                            <TableCell>${fee.amount_paid}</TableCell>
                                            <TableCell>${fee.amount_due}</TableCell>
                                            <TableCell>
                                                {fee.due_date ? new Date(fee.due_date).toLocaleDateString() : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        fee.status === 'paid'
                                                            ? 'default'
                                                            : fee.status === 'partial'
                                                            ? 'secondary'
                                                            : 'destructive'
                                                    }
                                                >
                                                    {fee.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

StudentsShow.layout = {
    breadcrumbs: [
        {
            title: 'Students',
            href: students.index(),
        },
        {
            title: 'View',
            href: '#',
        },
    ],
};
