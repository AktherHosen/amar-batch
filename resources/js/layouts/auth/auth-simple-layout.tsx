import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
    stats,
}: AuthLayoutProps) {
    const safeStats = stats || {
        total_students: 0,
        active_batches: 0,
        attendance_rate: 0,
        fee_collection_rate: 0,
    };

    const displayStats = [
        { number: `${safeStats.total_students}+`, label: 'Students' },
        { number: `${safeStats.active_batches}+`, label: 'Batches' },
        { number: `${safeStats.attendance_rate}%`, label: 'Attendance' },
        {
            number: `${safeStats.fee_collection_rate}%`,
            label: 'Fee Collection',
        },
    ];

    return (
        <div className="flex min-h-svh">
            {/* Left side - Branding */}
            <div className="hidden w-1/2 bg-primary lg:flex lg:flex-col lg:items-center lg:justify-center">
                <div className="text-center">
                    <Link
                        href={home()}
                        className="flex flex-col items-center gap-4"
                    >
                        <img src="/logo.png" alt="Amar Batch" className="h-12 w-12 rounded-xl object-cover" />
                        <h1 className="text-3xl font-bold text-primary-foreground">
                            Amar Batch
                        </h1>
                    </Link>
                    <p className="mt-4 max-w-md text-lg text-primary-foreground/80">
                        Complete Coaching Center Management System
                    </p>
                    <div className="mt-12 grid grid-cols-2 gap-6 text-left">
                        {displayStats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-xl bg-primary-foreground/10 p-4 backdrop-blur-sm"
                            >
                                <div className="text-2xl font-bold text-primary-foreground">
                                    {stat.number}
                                </div>
                                <div className="text-sm text-primary-foreground/80">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex w-full items-center justify-center bg-background p-6 lg:w-1/2">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="mb-8 flex flex-col items-center lg:hidden">
                        <Link href={home()} className="flex flex-col items-center gap-3">
                            <img src="/logo.png" alt="Amar Batch" className="h-12 w-12 rounded-md object-cover" />
                            <span className="text-xl font-bold text-foreground">
                                Amar Batch
                            </span>
                        </Link>
                    </div>

                    <div className="rounded-md border border-border p-6 lg:border-0 lg:p-0">
                        <div className="mb-8">
                            <h2 className="text-lg font-bold text-foreground sm:text-2xl">
                                {title}
                            </h2>
                            <p className="mt-2 text-muted-foreground">
                                {description}
                            </p>
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
