import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Pencil, Trash2, UserMinus } from 'lucide-react';
import batches from '@/routes/batches';

type PageProps = {
    auth: { user: { role: string } };
};

type Teacher = {
    id: number;
    name: string;
    email: string;
};

type Student = {
    id: number;
    name: string;
    email: string;
};

type Enrollment = {
    id: number;
    student: Student;
    status: string;
    enrolled_at: string;
};

type Batch = {
    id: number;
    name: string;
    subject: string | null;
    schedule: string | null;
    capacity: number;
    start_date: string | null;
    end_date: string | null;
    fees_amount: number;
    status: string;
    enrollments: Enrollment[];
    teachers: Teacher[];
};

type BatchesShowProps = {
    batch: Batch;
    teachers: Teacher[];
};

export default function BatchesShow({ batch, teachers }: BatchesShowProps) {
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';
    const [selectedTeacher, setSelectedTeacher] = useState('');

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${batch.name}?`)) {
            router.delete(batches.destroy(batch.id));
        }
    };

    const handleAssignTeacher = () => {
        if (!selectedTeacher) return;

        router.post(batches.assignTeacher(batch.id), { teacher_id: parseInt(selectedTeacher) }, {
            preserveScroll: true,
            onSuccess: () => setSelectedTeacher(''),
        });
    };

    const handleRemoveTeacher = (teacherId: number) => {
        if (confirm('Are you sure you want to remove this teacher?')) {
            router.delete(batches.removeTeacher(batch.id), {
                data: { teacher_id: teacherId },
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            active: 'default',
            inactive: 'secondary',
            archived: 'destructive',
        };
        return variants[status] || 'secondary';
    };

    const availableTeachers = teachers.filter(
        (t) => !batch.teachers.some((bt) => bt.id === t.id)
    );

    return (
        <>
            <Head title={batch.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={batches.index()}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 size-4" />
                                Back
                            </Button>
                        </Link>
                        <Heading title={batch.name} description="Batch Details" />
                    </div>
                    {isAdmin && (
                        <div className="flex gap-2">
                            <Link href={batches.edit(batch.id)}>
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
                            <CardTitle>Batch Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{batch.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Subject</p>
                                <p className="font-medium">{batch.subject || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Capacity</p>
                                <p className="font-medium">{batch.capacity}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Enrolled</p>
                                <p className="font-medium">{batch.enrollments.length}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Fees</p>
                                <p className="font-medium">${batch.fees_amount}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge variant={getStatusBadge(batch.status)}>{batch.status}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Schedule</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Start Date</p>
                                <p className="font-medium">
                                    {batch.start_date ? new Date(batch.start_date).toLocaleDateString() : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">End Date</p>
                                <p className="font-medium">
                                    {batch.end_date ? new Date(batch.end_date).toLocaleDateString() : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Schedule</p>
                                <p className="font-medium">{batch.schedule || '-'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {isAdmin && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Teachers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {batch.teachers.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {batch.teachers.map((teacher) => (
                                            <TableRow key={teacher.id}>
                                                <TableCell className="font-medium">{teacher.name}</TableCell>
                                                <TableCell>{teacher.email}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveTeacher(teacher.id)}
                                                    >
                                                        <UserMinus className="size-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground">No teachers assigned.</p>
                            )}

                            {availableTeachers.length > 0 && (
                                <div className="mt-4 flex gap-2">
                                    <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Select a teacher" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableTeachers.map((teacher) => (
                                                <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                    {teacher.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={handleAssignTeacher} disabled={!selectedTeacher}>
                                        Assign
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {batch.enrollments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Enrolled Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Enrolled At</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {batch.enrollments.map((enrollment) => (
                                        <TableRow key={enrollment.id}>
                                            <TableCell className="font-medium">{enrollment.student.name}</TableCell>
                                            <TableCell>{enrollment.student.email}</TableCell>
                                            <TableCell>{new Date(enrollment.enrolled_at).toLocaleDateString()}</TableCell>
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
            </div>
        </>
    );
}

BatchesShow.layout = {
    breadcrumbs: [
        {
            title: 'Batches',
            href: batches.index(),
        },
        {
            title: 'View',
            href: '#',
        },
    ],
};
