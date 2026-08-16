import { useRef, useState } from 'react';
import { X, User } from 'lucide-react';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

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
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex size-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/25 bg-muted transition-colors hover:border-muted-foreground/50"
                    >
                        {preview ? (
                            <img
                                src={preview}
                                alt="Avatar preview"
                                className="size-full object-cover"
                            />
                        ) : (
                            <User className="size-8 text-muted-foreground/50" />
                        )}
                    </button>
                    {preview && (
                        <button
                            type="button"
                            onClick={removeAvatar}
                            className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground"
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
                <div className="space-y-2 text-center">
                    <Label>{label}</Label>
                    {hint && (
                        <p className="text-xs text-muted-foreground">{hint}</p>
                    )}
                    {error && <InputError message={error} />}
                </div>
            </div>
        </div>
    );
}