import { router } from '@inertiajs/react';
import {
    Download,
    EllipsisVertical,
    Plus,
    Upload,
    FileDown,
    FileUp,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale } from '@/contexts/locale-context';
import { exportToExcel, importFromExcel } from '@/lib/excel';

type PageActionsProps = {
    isAdmin: boolean;
    createLabel: string;
    onCreate: () => void;
    exportTitle: string;
    exportFilename: string;
    exportHeaders: string[];
    exportRows: (string | number | boolean | null)[][];
    importUrl: string;
    importFields: string[];
    onImportSuccess?: () => void;
    extraItems?: React.ReactNode;
};

export default function PageActions({
    isAdmin,
    createLabel,
    onCreate,
    exportTitle,
    exportFilename,
    exportHeaders,
    exportRows,
    importUrl,
    importFields,
    onImportSuccess,
    extraItems,
}: PageActionsProps) {
    const { t } = useLocale();
    const [importOpen, setImportOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        exportToExcel({
            title: exportTitle,
            headers: exportHeaders,
            rows: exportRows,
            filename: exportFilename,
        });
        toast.success(t('toast.copied_to_clipboard'));
    };

    const handleDownloadSample = () => {
        const ws = XLSX.utils.aoa_to_sheet([importFields]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, `${exportFilename}_sample.xlsx`);
    };

    const handleImport = async () => {
        if (!selectedFile) {
return;
}

        setImporting(true);

        try {
            const { headers, rows } = await importFromExcel(selectedFile);

            const mapped = rows.map((row) => {
                const obj: Record<string, string | number> = {};
                headers.forEach((h, i) => {
                    const field = importFields.find(
                        (f) =>
                            f.toLowerCase() ===
                            h.toLowerCase().replace(/\s+/g, '_'),
                    );

                    if (field) {
                        obj[field] = row[i] ?? '';
                    }
                });

                return obj;
            });

            router.post(
                importUrl,
                { rows: mapped },
                {
                    onSuccess: () => {
                        toast.success(`Imported ${mapped.length} records`);
                        setImportOpen(false);
                        setSelectedFile(null);
                        onImportSuccess?.();
                    },
                    onError: (errors) => {
                        toast.error(Object.values(errors)[0] as string);
                    },
                },
            );
        } catch (err) {
            toast.error('Failed to parse Excel file');
        } finally {
            setImporting(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 p-0">
                        <EllipsisVertical className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {isAdmin && (
                        <DropdownMenuItem onClick={onCreate}>
                            <Plus className="mr-2 size-4" />
                            {createLabel}
                        </DropdownMenuItem>
                    )}
                    {extraItems}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleExport}>
                        <Download className="mr-2 size-4" />
                        {t('actions.export_csv')}
                    </DropdownMenuItem>
                    {isAdmin && (
                        <DropdownMenuItem onClick={() => setImportOpen(true)}>
                            <Upload className="mr-2 size-4" />
                            Import
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Import Excel</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
                        >
                            <FileUp className="size-8 text-muted-foreground" />
                            {selectedFile ? (
                                <p className="text-sm font-medium">
                                    {selectedFile.name}
                                </p>
                            ) : (
                                <>
                                    <p className="text-sm text-muted-foreground">
                                        Click to select Excel file
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        .xlsx, .xls, or .csv
                                    </p>
                                </>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                            onChange={(e) =>
                                setSelectedFile(e.target.files?.[0] ?? null)
                            }
                        />

                        <button
                            onClick={handleDownloadSample}
                            className="flex w-full items-center gap-2 rounded-md border p-3 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
                        >
                            <FileDown className="size-4 shrink-0" />
                            <span>Download sample file</span>
                        </button>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setImportOpen(false);
                                setSelectedFile(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={!selectedFile || importing}
                        >
                            {importing ? 'Importing...' : 'Import'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
