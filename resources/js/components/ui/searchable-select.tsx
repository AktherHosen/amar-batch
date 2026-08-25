import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type Option = {
    value: string;
    label: string;
    description?: string;
    searchText?: string;
};

type SearchableSelectProps = {
    options: Option[];
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    emptyText?: string;
    noResultsText?: string;
    className?: string;
};

export function SearchableSelect({
    options,
    value,
    onValueChange,
    placeholder = 'Search and select...',
    emptyText = 'No options available',
    noResultsText = 'No results found',
    className,
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    const selected = options.find((o) => o.value === value);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) {
            return options;
        }
        return options.filter(
            (o) =>
                o.label.toLowerCase().includes(q) ||
                (o.searchText ?? '').toLowerCase().includes(q),
        );
    }, [options, query]);

    const handleSelect = (opt: Option) => {
        onValueChange(opt.value);
        setOpen(false);
        setQuery('');
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        'h-9 justify-between font-normal',
                        !selected && 'text-muted-foreground',
                        className,
                    )}
                >
                    {selected ? selected.label : placeholder}
                    <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-full min-w-64 p-0">
                <div className="relative border-b">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search..."
                        className="h-9 border-0 pr-9 pl-9 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>
                <div className="max-h-60 overflow-y-auto p-1">
                    {options.length === 0 ? (
                        <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                            {emptyText}
                        </p>
                    ) : filtered.length === 0 ? (
                        <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                            {noResultsText}
                        </p>
                    ) : (
                        filtered.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleSelect(opt)}
                                className={cn(
                                    'flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                                    opt.value === value
                                        ? 'bg-accent text-accent-foreground'
                                        : 'hover:bg-accent hover:text-accent-foreground',
                                )}
                            >
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate">{opt.label}</span>
                                    {opt.description && (
                                        <span className="block truncate text-xs text-muted-foreground">
                                            {opt.description}
                                        </span>
                                    )}
                                </span>
                                {opt.value === value && (
                                    <Check className="size-4 shrink-0" />
                                )}
                            </button>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}