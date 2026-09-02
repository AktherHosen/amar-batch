import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { cn } from '@/lib/utils';

export interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const modules = {
    toolbar: [
        [{ undo: '' }, { redo: '' }],
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'code'],
        [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
        ['blockquote', 'link'],
        ['clean'],
    ],
};

const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'code',
    'list',
    'blockquote',
    'link',
];

export function RichTextEditor({
    value,
    onChange,
    placeholder = 'Type your instructions...',
    className,
}: RichTextEditorProps) {
    return (
        <div
            className={cn(
                'rounded-md border border-input bg-transparent shadow-sm focus-within:ring-1 focus-within:ring-ring',
                className,
            )}
        >
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
            />
        </div>
    );
}
