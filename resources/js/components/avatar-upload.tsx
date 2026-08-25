import { X, User } from 'lucide-react';
import { useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type AvatarUploadProps = {
    value: string | null;
    onChange: (file: File | null) => void;
    label: string;
    hint?: string;
    error?: string;
};

export function AvatarUpload({
    value,
    onChange,
    label,
    hint,
    error,
}: AvatarUploadProps) {
    const [preview, setPreview] = useState<string | null>(
        value ? `/storage/${value}` : null,
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];

        if (selected) {
            onChange(selected);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(selected);
        }
    };

    const removeAvatar = () => {
        onChange(null);
        setPreview(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex items-center gap-4">
                {/* Avatar circle */}
                <div className="relative shrink-0">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex size-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-primary/40 bg-muted transition-colors hover:border-primary hover:bg-muted/80"
                    >
                        {preview ? (
                            <img
                                src={preview}
                                alt="Avatar preview"
                                className="size-full object-cover"
                            />
                        ) : (
                            <User className="size-8 text-muted-foreground" />
                        )}
                    </button>
                    {preview && (
                        <button
                            type="button"
                            onClick={removeAvatar}
                            className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground shadow"
                        >
                            <X className="size-3" />
                        </button>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                    />
                </div>

                {/* Text */}
                <div className="space-y-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {preview ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    {hint && (
                        <p className="text-xs text-muted-foreground">{hint}</p>
                    )}
                    {error && <InputError message={error} />}
                </div>
            </div>
        </div>
    );
}