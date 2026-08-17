import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ListFilter, Search, SlidersHorizontal, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
    let timer: ReturnType<typeof setTimeout>;
    const debounced = (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
    debounced.cancel = () => clearTimeout(timer);

    return debounced;
}

type FilterOption = {
    label: string;
    value: string;
};

type FilterBarProps = {
    searchPlaceholder: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
    filters?: Array<{
        id: string;
        placeholder: string;
        value: string;
        options: FilterOption[];
        onValueChange: (value: string) => void;
    }>;
    activeFilterCount?: number;
    onClearAll?: () => void;
    active?: boolean;
    className?: string;
    children?: ReactNode;
    customFilters?: ReactNode;
};

export function FilterBar({
    searchPlaceholder,
    searchValue,
    onSearchChange,
    filters = [],
    activeFilterCount = 0,
    onClearAll,
    active,
    className,
    children,
    customFilters,
}: FilterBarProps) {
    const [localSearch, setLocalSearch] = useState(searchValue);

    useEffect(() => setLocalSearch(searchValue), [searchValue]);

    const debouncedSearch = useCallback(
        debounce((value: string) => onSearchChange(value), 300),
        [],
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const hasActiveFilters =
        active !== undefined
            ? active
            : activeFilterCount > 0 || filters.some((f) => f.value);
    const hasFilters = filters.length > 0;

    return (
        <div
            className={`flex flex-col gap-2 sm:flex-row sm:items-center ${className ?? ''}`}
        >
            <div className="relative w-full sm:flex-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder={searchPlaceholder}
                    value={localSearch}
                    onChange={(e) => {
                        setLocalSearch(e.target.value);
                        debouncedSearch(e.target.value);
                    }}
                    className="h-9 pr-9 pl-9"
                />
                {localSearch && (
                    <button
                        type="button"
                        onClick={() => {
                            setLocalSearch('');
                            onSearchChange('');
                        }}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="size-4" />
                    </button>
                )}
            </div>

            <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-start">
                {hasFilters && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={
                                    hasActiveFilters ? 'default' : 'outline'
                                }
                                size="sm"
                                className="h-9 flex-1 gap-2 sm:flex-none"
                            >
                                <ListFilter className="size-4" />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="flex size-4 items-center justify-center rounded-full bg-background/20 text-[10px] font-medium">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="end"
                            className="w-[min(24rem,calc(100vw-2rem))] p-4"
                        >
                            <div
                                className={`grid grid-cols-1 gap-3 ${filters.length > 1 ? 'sm:grid-cols-2' : ''}`}
                            >
                                {filters.map((filter) => (
                                    <div
                                        key={filter.id}
                                        className="space-y-1.5"
                                    >
                                        <label className="text-xs font-medium text-muted-foreground">
                                            {filter.placeholder}
                                        </label>
                                        <Select
                                            value={filter.value || 'all'}
                                            onValueChange={(value) =>
                                                filter.onValueChange(
                                                    value === 'all'
                                                        ? ''
                                                        : value,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="h-9 w-full">
                                                <SelectValue
                                                    placeholder={
                                                        filter.placeholder
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All
                                                </SelectItem>
                                                {filter.options.map(
                                                    (option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </div>
                            {customFilters && (
                                <div className="mt-3">{customFilters}</div>
                            )}
                            {hasActiveFilters && onClearAll && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4 w-full gap-2 text-muted-foreground hover:text-foreground"
                                    onClick={onClearAll}
                                >
                                    <SlidersHorizontal className="size-3.5" />
                                    Clear all
                                </Button>
                            )}
                        </PopoverContent>
                    </Popover>
                )}

                {children}
            </div>
        </div>
    );
}
