import React, { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
} from '@tanstack/react-table';
import {
    ChevronDown,
    ChevronUp,
    ChevronsUpDown,
    Columns3,
    Search,
    X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Pagination from '@/components/pagination';

export type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    loading?: boolean;
    pageCount?: number;
    pageIndex?: number;
    pageSize?: number;
    onPaginationChange?: (pageIndex: number, pageSize: number) => void;
    onSortingChange?: (sortBy: string, sortDir: 'asc' | 'desc') => void;
    currentPage?: number;
    lastPage?: number;
    total?: number;
    itemName?: string;
    baseUrl?: string;
    preserveParams?: Record<string, any>;
    enableSorting?: boolean;
    enableColumnVisibility?: boolean;
    storageKey?: string;
    showPagination?: boolean;
    emptyMessage?: string;
    toolbar?: ReactNode;
    searchable?: boolean;
    searchPlaceholder?: string;
    getRowId?: (row: TData, index?: number, parent?: any) => string;
};

export function DataTable<TData, TValue>({
    columns,
    data,
    loading = false,
    onPaginationChange,
    onSortingChange,
    currentPage = 1,
    lastPage = 1,
    total = 0,
    itemName = '',
    baseUrl,
    preserveParams = {},
    enableSorting = true,
    enableColumnVisibility = true,
    storageKey,
    showPagination = true,
    emptyMessage = 'No records found',
    toolbar,
    searchable = false,
    searchPlaceholder = 'Search...',
    getRowId,
}: DataTableProps<TData, TValue>) {
    const resolvedStorageKey =
        storageKey ??
        (columns.length > 0
            ? `datatable:${columns.map((c) => String(c.id)).join('|')}`
            : undefined);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        () => {
            if (!resolvedStorageKey) return {};
            try {
                const raw = localStorage.getItem(resolvedStorageKey);
                return raw ? (JSON.parse(raw) as VisibilityState) : {};
            } catch {
                return {};
            }
        },
    );
    const [pagination, setPagination] = useState({
        pageIndex: currentPage - 1,
        pageSize: 10,
    });

    useEffect(() => {
        setPagination({
            pageIndex: currentPage - 1,
            pageSize: pagination.pageSize,
        });
    }, [currentPage]);

    useEffect(() => {
        if (!onSortingChange || sorting.length === 0) {
            return;
        }
        const s = sorting[0];
        onSortingChange(String(s.id), s.desc ? 'desc' : 'asc');
    }, [sorting]);

    const table = useReactTable({
        data,
        columns,
        getRowId,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            columnVisibility,
            pagination: showPagination ? pagination : undefined,
        },
        onGlobalFilterChange: searchable ? setGlobalFilter : undefined,
        onSortingChange: enableSorting ? setSorting : undefined,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: (updater) => {
            setColumnVisibility((prev) => {
                const next =
                    typeof updater === 'function' ? updater(prev) : updater;
                if (resolvedStorageKey) {
                    try {
                        localStorage.setItem(
                            resolvedStorageKey,
                            JSON.stringify(next),
                        );
                    } catch {
                        // ignore storage errors
                    }
                }
                return next;
            });
        },
        onPaginationChange: showPagination ? setPagination : undefined,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
        getPaginationRowModel: showPagination
            ? getPaginationRowModel()
            : undefined,
        manualPagination: showPagination,
        manualSorting: !!onSortingChange,
    });

    const totalVisibleColumns = table.getVisibleLeafColumns().length;

    return (
        <div className="w-full">
            {(toolbar || enableColumnVisibility || searchable) && (
                <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                        <div className="min-w-0 flex-1">
                            {toolbar &&
                            enableColumnVisibility &&
                            React.isValidElement(toolbar)
                                ? React.cloneElement(
                                      toolbar as React.ReactElement<{
                                          children?: ReactNode;
                                      }>,
                                      {
                                          children: (
                                              <>
                                                  {toolbar.props.children}
                                                  <ColumnToggle table={table} />
                                              </>
                                          ),
                                      },
                                  )
                                : toolbar}
                            {!toolbar && searchable && (
                                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                                    <div className="relative w-full sm:flex-1">
                                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder={searchPlaceholder}
                                            value={globalFilter}
                                            onChange={(e) =>
                                                setGlobalFilter(e.target.value)
                                            }
                                            className="h-9 pr-9 pl-9"
                                        />
                                        {globalFilter && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setGlobalFilter('')
                                                }
                                                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                <X className="size-4" />
                                            </button>
                                        )}
                                    </div>
                                    {enableColumnVisibility && (
                                        <div className="flex w-full sm:w-auto sm:flex-none">
                                            <ColumnToggle table={table} />
                                        </div>
                                    )}
                                </div>
                            )}
                            {!toolbar &&
                                !searchable &&
                                enableColumnVisibility && (
                                    <div className="flex w-full sm:w-auto">
                                        <ColumnToggle table={table} />
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            )}

            <div className="rounded-md border">
                <Table className="w-max min-w-full">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={`whitespace-nowrap ${
                                            header.column.columnDef.meta?.sticky
                                                ? 'sticky left-0 z-10 min-w-[150px] rounded-tl-md bg-background'
                                                : ''
                                        } ${
                                            header.column.columnDef.meta
                                                ?.stickyRight
                                                ? 'sticky right-0 z-10 min-w-[100px] rounded-tr-md bg-background'
                                                : ''
                                        }`}
                                        colSpan={header.colSpan}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className={
                                                    header.column.getCanSort() &&
                                                    enableSorting
                                                        ? 'flex items-center gap-1 select-none'
                                                        : undefined
                                                }
                                            >
                                                {header.column.getCanSort() &&
                                                enableSorting ? (
                                                    <button
                                                        type="button"
                                                        onClick={header.column.getToggleSortingHandler()}
                                                        className="flex items-center gap-1 hover:text-foreground"
                                                    >
                                                        {flexRender(
                                                            header.column
                                                                .columnDef
                                                                .header,
                                                            header.getContext(),
                                                        )}
                                                        {{
                                                            asc: (
                                                                <ChevronUp className="size-3.5" />
                                                            ),
                                                            desc: (
                                                                <ChevronDown className="size-3.5" />
                                                            ),
                                                        }[
                                                            header.column.getIsSorted() as string
                                                        ] ?? (
                                                            <ChevronsUpDown className="size-3.5 opacity-60" />
                                                        )}
                                                    </button>
                                                ) : (
                                                    flexRender(
                                                        header.column.columnDef
                                                            .header,
                                                        header.getContext(),
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    {loading ? (
                        <TableBody>
                            <TableRow>
                                <TableCell
                                    colSpan={totalVisibleColumns}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Loading...
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    ) : table.getRowModel().rows.length === 0 ? (
                        <TableBody>
                            <TableRow>
                                <TableCell
                                    colSpan={totalVisibleColumns}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    ) : (
                        <motion.tbody
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: {},
                                visible: {
                                    transition: { staggerChildren: 0.03 },
                                },
                            }}
                        >
                            {table.getRowModel().rows.map((row, rowIndex) => (
                                <motion.tr
                                    key={
                                        getRowId
                                            ? getRowId(row.original)
                                            : row.id
                                    }
                                    variants={{
                                        hidden: { opacity: 0, x: -8 },
                                        visible: { opacity: 1, x: 0 },
                                    }}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={`whitespace-nowrap ${
                                                cell.column.columnDef.meta
                                                    ?.sticky
                                                    ? `sticky left-0 z-10 bg-background ${
                                                          rowIndex ===
                                                          table.getRowModel()
                                                              .rows.length -
                                                              1
                                                              ? 'rounded-bl-md'
                                                              : ''
                                                      }`
                                                    : ''
                                            } ${
                                                cell.column.columnDef.meta
                                                    ?.stickyRight
                                                    ? `sticky right-0 z-10 bg-background ${
                                                          rowIndex ===
                                                          table.getRowModel()
                                                              .rows.length -
                                                              1
                                                              ? 'rounded-br-md'
                                                              : ''
                                                      }`
                                                    : ''
                                            }`}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </motion.tr>
                            ))}
                        </motion.tbody>
                    )}
                </Table>
            </div>

            <div className="flex items-center justify-between gap-2 py-4">
                {showPagination && onPaginationChange ? (
                    <Pagination
                        currentPage={currentPage}
                        lastPage={lastPage}
                        total={total}
                        perPage={pagination.pageSize}
                        itemName={itemName}
                        baseUrl={baseUrl ?? ''}
                        preserveParams={preserveParams}
                    />
                ) : (
                    total > 0 && (
                        <div className="text-sm text-muted-foreground">
                            {total} {itemName}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export function ColumnToggle<TData>({
    table,
}: {
    table: ReturnType<typeof useReactTable<TData>>;
}) {
    const [open, setOpen] = useState(false);

    const hideableColumns = table
        .getAllColumns()
        .filter((col) => col.getCanHide());

    const [visibility, setVisibility] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(
            hideableColumns.map((column) => [column.id, column.getIsVisible()]),
        ),
    );

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (nextOpen) {
            setVisibility(
                Object.fromEntries(
                    hideableColumns.map((column) => [
                        column.id,
                        column.getIsVisible(),
                    ]),
                ),
            );
        }
    };

    const handleCheckedChange = (
        column: (typeof hideableColumns)[number],
        value: boolean,
    ) => {
        setVisibility((prev) => ({ ...prev, [column.id]: value }));
        column.toggleVisibility(!!value);
    };

    return (
        <DropdownMenu open={open} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 flex-1 gap-2 sm:flex-none"
                >
                    <Columns3 className="size-4" />
                    View
                    <ChevronDown className="size-3.5 opacity-60" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {hideableColumns.map((column) => (
                    <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={visibility[column.id] ?? true}
                        onCheckedChange={(value) =>
                            handleCheckedChange(column, !!value)
                        }
                        onSelect={(e) => e.preventDefault()}
                    >
                        {typeof column.columnDef.header === 'string'
                            ? column.columnDef.header
                            : String(column.columnDef.id)}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
