import { useRef, useState } from 'react';
import { ImagePlus, UploadCloud, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';

type LogoUploadProps = {
    initialPreview?: string | null;
    onChange: (file: File | null) => void;
    label: string;
    hint?: string;
    error?: string;
};

export function LogoUpload({
    initialPreview,
    onChange,
    label,
    hint,
    error,
}: LogoUploadProps) {
    const [preview, setPreview] = useState<string | null>(
        initialPreview ? `/storage/${initialPreview}` : null,
    );
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File | undefined | null) => {
        if (!file) return;

        onChange(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files?.[0]);
    };

    const removeLogo = () => {
        onChange(null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>

            <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        fileInputRef.current?.click();
                    }
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={cn(
                    'flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition-colors',
                    dragging
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 bg-muted hover:border-muted-foreground/50',
                )}
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Logo preview"
                        className="max-h-20 max-w-full rounded-lg object-contain"
                    />
                ) : (
                    <>
                        <div className="flex size-12 items-center justify-center rounded-full bg-background/70">
                            <UploadCloud className="size-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                Drag &amp; drop your logo here
                            </p>
                            <p className="text-xs text-muted-foreground">
                                or click to browse
                            </p>
                        </div>
                    </>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ImagePlus className="size-3.5" />
                    PNG, JPG or SVG
                </span>
            </div>

            {preview && (
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                        <ImagePlus className="size-3.5" />
                        Change
                    </button>
                    <button
                        type="button"
                        onClick={removeLogo}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive hover:text-destructive"
                    >
                        <X className="size-3.5" />
                        Remove
                    </button>
                </div>
            )}

            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            {error && <InputError message={error} />}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="hidden"
            />
        </div>
    );
}
