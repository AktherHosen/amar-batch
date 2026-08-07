# Agents - Project Conventions

## Code Style

- Use `whitespace-nowrap` on all `TableHead` and `TableCell` components
- Sticky first column on wide tables: `sticky left-0 bg-background z-10`
- Badge variants: `success` (green-600) for completed, `danger` (red-600) for inactive/dropped
- Button `destructive` variant: `bg-red-600 text-white`

## UI Patterns

### Multi-Action Dropdowns
Use `EllipsisVertical` icon in a `DropdownMenu` for tables with edit + delete:
```tsx
<DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="size-8 p-0">
            <EllipsisVertical className="size-4" />
        </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.get(editRoute(id))}>
            <PenLine className="mr-2 size-4" />
            Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 size-4" />
            Delete
        </DropdownMenuItem>
    </DropdownMenuContent>
</DropdownMenu>
```

### Single-Action Delete
For tables where only delete is needed, use a direct button:
```tsx
<Button variant="ghost" size="sm" className="size-8 p-0 text-destructive hover:text-destructive" onClick={handleDelete}>
    <Trash2 className="size-4" />
</Button>
```

### Search Bars
Always include:
- `X` icon button to reset filter (calls `router.get` with cleared params)
- `RefreshCw` icon button with `animate-spin` class while loading

### Pagination
Use the reusable `Pagination` component with:
- 10 records per page
- Page numbers with ellipsis for large page counts
- Only show when `lastPage > 1`

### Confirm Dialogs
Use `ConfirmDialog` component (not browser `confirm()`) with `sonner` toast for success messages.

### Tables
- First column: `sticky left-0 bg-background z-10 min-w-[150px]`
- All headers/cells: `whitespace-nowrap`
- Action column: `w-[50px]` or `w-[80px]`

## Dashboard

- Stat cards: `grid grid-cols-2 lg:grid-cols-4 gap-3`
- Charts: Use `chart.js` + `react-chartjs-2` (NOT recharts - React 19 incompatibility)
- Chart types: doughnut (attendance), bar (enrollment trend), line (fee collection)
- Clock: Hidden on mobile (`hidden lg:block`), right-aligned

## Batch Detail Pages

- Heading: batch name in h1
- Info: `grid grid-cols-2 gap-3` cards
- Actions: `EllipsisVertical` dropdown

## Student Detail Pages

- Match batch detail style (icon-only back button, h1 title, `grid grid-cols-2 gap-3` cards)

## Backend

- All controllers use `paginate(10)` for index endpoints
- Accept `per_page` param but default to 10
- Use `withQueryString()` on paginated results
- Attendance batch filtering: `where('status', '!=', 'completed')`

## Route Generation

After adding new routes, regenerate Wayfinder typed routes:
```bash
php artisan wayfinder:generate
```

## Common Imports

```tsx
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { EllipsisVertical, PenLine, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
```
