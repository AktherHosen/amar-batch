import { Head, router, useForm, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { toast } from 'sonner';
import { useState } from 'react';
import { Copy, Eye, EyeOff, Plus, Trash2, Key } from 'lucide-react';

type Token = {
    id: number;
    name: string;
    abilities: string[];
    last_used_at: string | null;
    created_at: string;
};

type PageProps = {
    tokens: Token[];
};

export default function ApiSettings({ tokens }: PageProps) {
    const { data, setData, post, processing, errors, reset } = useForm({ name: '' });
    const [newToken, setNewToken] = useState<string | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; token: Token | null }>({ open: false, token: null });
    const [showToken, setShowToken] = useState(false);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings/api', {
            onSuccess: (page: any) => {
                setNewToken(page.props.flash?.token || null);
                reset();
                toast.success('Token created successfully');
            },
        });
    };

    const handleDelete = (token: Token) => {
        setDeleteDialog({ open: true, token });
    };

    const confirmDelete = () => {
        if (deleteDialog.token) {
            router.delete(`/settings/api/${deleteDialog.token.id}`, {
                onSuccess: () => {
                    toast.success('Token revoked successfully');
                    setDeleteDialog({ open: false, token: null });
                },
            });
        }
    };

    const copyToken = () => {
        if (newToken) {
            navigator.clipboard.writeText(newToken);
            toast.success('Token copied to clipboard');
        }
    };

    return (
        <>
            <Head title="API Settings" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading title="API Access" description="Manage API tokens for external integrations" />

                {newToken && (
                    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-green-800 dark:text-green-200">New Token Created</h3>
                                    <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                                        Copy this token now. It won't be shown again.
                                    </p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <code className="rounded bg-green-100 px-2 py-1 text-sm font-mono dark:bg-green-900">
                                            {showToken ? newToken : '••••••••••••••••'}
                                        </code>
                                        <Button variant="ghost" size="sm" onClick={() => setShowToken(!showToken)}>
                                            {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={copyToken}>
                                            <Copy className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setNewToken(null)}>
                                    Dismiss
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="size-5" />
                            Create New Token
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="flex items-end gap-3">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="name">Token Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Mobile App, CI/CD Pipeline"
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>
                            <Button type="submit" disabled={processing}>
                                <Plus className="mr-2 size-4" />
                                Create
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Existing Tokens</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {tokens.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No API tokens yet.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="sticky left-0 z-10 min-w-[150px] bg-background">Name</TableHead>
                                        <TableHead>Abilities</TableHead>
                                        <TableHead>Last Used</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tokens.map((token) => (
                                        <TableRow key={token.id}>
                                            <TableCell className="sticky left-0 z-10 min-w-[150px] bg-background font-medium whitespace-nowrap">
                                                {token.name}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <Badge variant="outline">{token.abilities.join(', ')}</Badge>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {token.last_used_at ? new Date(token.last_used_at).toLocaleDateString() : 'Never'}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {new Date(token.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="p-1 text-center whitespace-nowrap">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="size-8 p-0 text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(token)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
                title="Revoke Token"
                description="Are you sure you want to revoke this token? Any application using it will lose access."
                confirmText="Revoke"
                onConfirm={confirmDelete}
            />
        </>
    );
}

ApiSettings.layout = {
    breadcrumbs: [{ title: 'API Settings', href: '/settings/api' }],
};
