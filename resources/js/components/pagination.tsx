import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/contexts/locale-context';

type PaginationProps = {
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
    itemName: string;
    baseUrl: string;
    preserveParams?: Record<string, any>;
};

export default function Pagination({
    currentPage,
    lastPage,
    total,
    perPage,
    itemName,
    baseUrl,
    preserveParams = {},
}: PaginationProps) {
    const { t } = useLocale();

    if (total <= 0) {
return null;
}

    const goToPage = (page: number) => {
        router.get(
            baseUrl,
            { ...preserveParams, page },
            { preserveState: true },
        );
    };

    const from = Math.min(perPage * (currentPage - 1) + 1, total);
    const to = Math.min(perPage * currentPage, total);

    return (
        <div className="mt-4 flex w-full items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm text-muted-foreground">
                {t('pagination.showing')
                    .replace('{from}', String(from))
                    .replace('{to}', String(to))
                    .replace('{total}', String(total))
                    .replace('{itemName}', itemName)}
            </p>
            <div className="flex shrink-0 items-center gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage <= 1}
                    onClick={() => goToPage(currentPage - 1)}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                {generatePageNumbers(currentPage, lastPage).map((page, i) =>
                    page === '...' ? (
                        <span
                            key={`dots-${i}`}
                            className="px-2 text-muted-foreground"
                        >
                            ...
                        </span>
                    ) : (
                        <Button
                            key={page}
                            variant={
                                currentPage === page ? 'default' : 'outline'
                            }
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => goToPage(page as number)}
                        >
                            {page}
                        </Button>
                    ),
                )}
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage >= lastPage}
                    onClick={() => goToPage(currentPage + 1)}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

function generatePageNumbers(
    current: number,
    last: number,
): (number | string)[] {
    if (last <= 7) {
        return Array.from({ length: last }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    pages.push(1);

    if (current > 3) {
        pages.push('...');
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(last - 1, current + 1);

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (current < last - 2) {
        pages.push('...');
    }

    pages.push(last);

    return pages;
}
