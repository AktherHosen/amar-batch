import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh">
            {/* Left side - Branding */}
            <div className="hidden w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 lg:flex lg:flex-col lg:items-center lg:justify-center">
                <div className="text-center">
                    <Link href={home()} className="flex flex-col items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                            <span className="text-3xl font-bold text-white">K</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white">Karnaphuli Alpha Academy</h1>
                    </Link>
                    <p className="mt-4 max-w-md text-lg text-blue-100">
                        Complete Coaching Center Management System
                    </p>
                    <div className="mt-12 grid grid-cols-2 gap-6 text-left">
                        <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                            <div className="text-2xl font-bold text-white">500+</div>
                            <div className="text-sm text-blue-100">Students</div>
                        </div>
                        <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                            <div className="text-2xl font-bold text-white">50+</div>
                            <div className="text-sm text-blue-100">Batches</div>
                        </div>
                        <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                            <div className="text-2xl font-bold text-white">98%</div>
                            <div className="text-sm text-blue-100">Attendance</div>
                        </div>
                        <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                            <div className="text-2xl font-bold text-white">100%</div>
                            <div className="text-sm text-blue-100">Fee Collection</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex w-full items-center justify-center bg-white p-6 dark:bg-gray-950 lg:w-1/2">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="mb-8 flex flex-col items-center lg:hidden">
                        <Link href={home()} className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
                                <span className="text-lg font-bold text-white">K</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                Karnaphuli Alpha Academy
                            </span>
                        </Link>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
