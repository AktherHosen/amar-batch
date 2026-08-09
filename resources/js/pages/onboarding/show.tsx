import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/onboarding';

export default function Onboarding() {
    return (
        <>
            <Head title="Set Up Your Coaching Center" />
            <Form
                action={store.url()}
                method="post"
                resetOnSuccess={[]}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Set up your coaching center
                                </h2>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    Complete your account setup to get started
                                </p>
                            </div>

                            <div className="rounded-lg border bg-muted/30 p-4">
                                <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                                    Coaching Center Details
                                </h3>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="coaching_name"
                                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            Coaching Center Name *
                                        </Label>
                                        <Input
                                            id="coaching_name"
                                            type="text"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="organization"
                                            name="coaching_name"
                                            placeholder="e.g., Bright Minds Academy"
                                            className="h-12 rounded-xl border-gray-200 bg-gray-50 px-4 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                                        />
                                        <InputError
                                            message={errors.coaching_name}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="coaching_email"
                                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Center Email
                                            </Label>
                                            <Input
                                                id="coaching_email"
                                                type="email"
                                                tabIndex={2}
                                                autoComplete="email"
                                                name="coaching_email"
                                                placeholder="center@example.com"
                                                className="h-12 rounded-xl border-gray-200 bg-gray-50 px-4 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                                            />
                                            <InputError
                                                message={errors.coaching_email}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="coaching_phone"
                                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Center Phone
                                            </Label>
                                            <Input
                                                id="coaching_phone"
                                                type="tel"
                                                tabIndex={3}
                                                autoComplete="tel"
                                                name="coaching_phone"
                                                placeholder="+880 1XXX-XXXXXX"
                                                className="h-12 rounded-xl border-gray-200 bg-gray-50 px-4 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                                            />
                                            <InputError
                                                message={errors.coaching_phone}
                                                className="mt-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700"
                                tabIndex={4}
                            >
                                {processing && <Spinner />}
                                Create Coaching Center
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}
