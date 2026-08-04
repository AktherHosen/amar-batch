import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { type Student } from '@/types';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import students from '@/routes/students';

type PageProps = {
    auth: { user: { role: string } };
    students: {
        data: Student[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
};

export default function StudentsIndex({ students: pagination, filters }: PageProps) {
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleSearch = () => {
        router.get(students.index(), { search, status }, { preserveState: true });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value === 'all' ? '' : value);
        router.get(students.index(), { search, status: value === 'all' ? '' : value }, { preserveState: true });
    };

    const handleDelete = (student: Student) => {
        if (confirm(`Are you sure you want to delete ${student.name}?`)) {
            router.delete(students.destroy(student.id));
        }
    };

    return (
        <>
            <Head title="Students" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Students" description="Manage all students" />
                    {isAdmin && (
                        <Link href={students.create()}>
                            <Button>
                                <Plus className="mr-2 size-4" />
                                Add Student
                            </Button>
                        </Link>
                    )}
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search students..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={status || 'all'} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="secondary" onClick={handleSearch}>
                                Search
                            </Button>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Guardian</TableHead>
                                    <TableHead>Joined At</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pagination.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">
                                            No students found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pagination.data.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">{student.name}</TableCell>
                                            <TableCell>
                                                {student.coaching_class
                                                    ? `${student.coaching_class.name}${student.section ? ` - ${student.section}` : ''}`
                                                    : student.section || '-'}
                                            </TableCell>
                                            <TableCell>{student.phone || '-'}</TableCell>
                                            <TableCell>{student.guardian_name || '-'}</TableCell>
                                            <TableCell>
                                                {student.joined_at
                                                    ? new Date(student.joined_at).toLocaleDateString()
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                                                    {student.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={students.show(student.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="size-4" />
                                                        </Button>
                                                    </Link>
                                                    {isAdmin && (
                                                        <>
                                                            <Link href={students.edit(student.id)}>
                                                                <Button variant="ghost" size="sm">
                                                                    <Pencil className="size-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(student)}>
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {pagination.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {pagination.data.length} of {pagination.total} students
                                </p>
                                <div className="flex gap-2">
                                    {pagination.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(
                                                    students.index(),
                                                    { page: pagination.current_page - 1, search, status },
                                                    { preserveState: true }
                                                )
                                            }
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {pagination.current_page < pagination.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(
                                                    students.index(),
                                                    { page: pagination.current_page + 1, search, status },
                                                    { preserveState: true }
                                                )
                                            }
                                        >
                                            Next
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

StudentsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Students',
            href: students.index(),
        },
    ],
};
