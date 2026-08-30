import { motion } from 'framer-motion';
import { ListFilter, Search, SlidersHorizontal, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
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
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
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
        <div className={`w-full ${className ?? ''}`}>
            <div className="flex items-center gap-2">
                {searchPlaceholder && (
                    <div className="relative min-w-0 flex-1">
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
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                    </div>
                )}

                <div className="flex shrink-0 items-center gap-2">
                    {hasFilters && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="h-9 shrink-0 gap-1 px-2.5 sm:gap-2 sm:px-3"
                                >
                                    <ListFilter className="size-4" />
                                    <span className="hidden sm:inline">
                                        Filters
                                    </span>
                                    {activeFilterCount > 0 && (
                                        <span className="flex size-4 items-center justify-center rounded-full bg-background/20 text-[10px] font-medium">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                align="end"
                                className="w-auto max-w-[calc(100vw-3rem)] min-w-[18rem] p-0 sm:max-w-[26rem]"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.97 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        duration: 0.15,
                                        ease: 'easeOut',
                                    }}
                                    className="p-4"
                                >
                                    <div
                                        className={`grid grid-cols-1 gap-2.5 ${filters.length > 1 ? 'sm:grid-cols-2' : ''}`}
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
                                                    value={
                                                        filter.value || 'all'
                                                    }
                                                    onValueChange={(value) =>
                                                        filter.onValueChange(
                                                            value === 'all'
                                                                ? ''
                                                                : value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger
                                                        size="sm"
                                                        className="w-full"
                                                    >
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
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        ))}
                                    </div>

                                    {customFilters && (
                                        <div className="mt-3 border-t pt-3">
                                            {customFilters}
                                        </div>
                                    )}

                                    {hasActiveFilters && onClearAll && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-3 w-full gap-2 text-muted-foreground hover:text-foreground"
                                            onClick={onClearAll}
                                        >
                                            <SlidersHorizontal className="size-3.5" />
                                            Reset
                                        </Button>
                                    )}
                                </motion.div>
                            </PopoverContent>
                        </Popover>
                    )}

                    {children}
                </div>
            </div>
        </div>
    );
}
