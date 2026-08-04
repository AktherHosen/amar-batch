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
    days: string | null;
    time: string | null;
    capacity: number;
    start_date: string | null;
    end_date: string | null;
    status: string;
    enrollments: Enrollment[];
    teachers: Teacher[];
};

type BatchesShowProps = {
    batch: Batch;
    teachers: Teacher[];
    students: Student[];
};

export default function BatchesShow({ batch, teachers, students }: BatchesShowProps) {
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [teacherSearch, setTeacherSearch] = useState('');
    const [studentSearch, setStudentSearch] = useState('');

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

    const handleEnrollStudent = () => {
        if (!selectedStudent) return;

        router.post(`/batches/${batch.id}/enroll`, { student_id: parseInt(selectedStudent) }, {
            preserveScroll: true,
            onSuccess: () => setSelectedStudent(''),
        });
    };

    const handleUpdateEnrollmentStatus = (enrollmentId: number, status: string) => {
        router.put(`/enrollments/${enrollmentId}`, { status }, {
            preserveScroll: true,
        });
    };

    const handleUnenroll = (enrollmentId: number) => {
        if (confirm('Are you sure you want to unenroll this student?')) {
            router.delete(`/enrollments/${enrollmentId}`, {
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            active: 'default',
            completed: 'secondary',
            dropped: 'destructive',
        };
        return variants[status] || 'secondary';
    };

    const availableTeachers = teachers.filter(
        (t) =>
            !batch.teachers.some((bt) => bt.id === t.id) &&
            (t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                t.email.toLowerCase().includes(teacherSearch.toLowerCase()))
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
                                <p className="text-sm text-muted-foreground">Days</p>
                                <p className="font-medium">{batch.days || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Time</p>
                                <p className="font-medium">{batch.time || '-'}</p>
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

                            {availableTeachers.length > 0 || teacherSearch ? (
                                <div className="mt-4 space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Search teachers by name or email..."
                                        value={teacherSearch}
                                        onChange={(e) => setTeacherSearch(e.target.value)}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    />
                                    {availableTeachers.length > 0 ? (
                                        <div className="flex gap-2">
                                            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue placeholder="Select a teacher" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableTeachers.map((teacher) => (
                                                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                            {teacher.name} ({teacher.email})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button onClick={handleAssignTeacher} disabled={!selectedTeacher}>
                                                Assign
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No teachers found.</p>
                                    )}
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                )}

                {(isAdmin || auth.user.role === 'teacher') && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Enroll Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {(() => {
                                const enrolledIds = batch.enrollments.map((e) => e.student.id);
                                const availableStudents = students.filter(
                                    (s) =>
                                        !enrolledIds.includes(s.id) &&
                                        s.name.toLowerCase().includes(studentSearch.toLowerCase())
                                );

                                return availableStudents.length > 0 || studentSearch ? (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Search students by name..."
                                            value={studentSearch}
                                            onChange={(e) => setStudentSearch(e.target.value)}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        />
                                        {availableStudents.length > 0 ? (
                                            <div className="flex gap-2">
                                                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                                    <SelectTrigger className="flex-1">
                                                        <SelectValue placeholder="Select a student" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableStudents.map((student) => (
                                                            <SelectItem key={student.id} value={student.id.toString()}>
                                                                {student.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button onClick={handleEnrollStudent} disabled={!selectedStudent}>
                                                    Enroll
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No students found.</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">All students are enrolled in this batch.</p>
                                );
                            })()}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Enrolled Students ({batch.enrollments.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {batch.enrollments.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Enrolled At</TableHead>
                                        <TableHead>Status</TableHead>
                                        {(isAdmin || auth.user.role === 'teacher') && (
                                            <TableHead className="text-right">Actions</TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {batch.enrollments.map((enrollment) => (
                                        <TableRow key={enrollment.id}>
                                            <TableCell className="font-medium">{enrollment.student.name}</TableCell>
                                            <TableCell>{new Date(enrollment.enrolled_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadge(enrollment.status)}>
                                                    {enrollment.status}
                                                </Badge>
                                            </TableCell>
                                            {(isAdmin || auth.user.role === 'teacher') && (
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {enrollment.status === 'active' && (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleUpdateEnrollmentStatus(enrollment.id, 'completed')}
                                                                >
                                                                    Complete
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleUpdateEnrollmentStatus(enrollment.id, 'dropped')}
                                                                >
                                                                    Drop
                                                                </Button>
                                                            </>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleUnenroll(enrollment.id)}
                                                        >
                                                            <UserMinus className="size-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-sm text-muted-foreground">No students enrolled yet.</p>
                        )}
                    </CardContent>
                </Card>
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
