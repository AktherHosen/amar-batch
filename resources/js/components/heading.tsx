export default function Heading({
    title,
    description,
    variant = 'default',
}: {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
}) {
    return (
        <header className={variant === 'small' ? '' : 'space-y-0.5'}>
            <h2
                className={
                    variant === 'small'
                        ? 'mb-0.5 text-sm font-medium sm:text-base'
                        : 'truncate text-lg font-semibold tracking-tight sm:text-xl'
                }
            >
                {title}
            </h2>
            {description && (
                <p className="text-xs text-muted-foreground sm:text-sm">{description}</p>
            )}
        </header>
    );
}
