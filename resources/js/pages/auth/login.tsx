import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Log in" />

            <Form
                action={store.url()}
                method="post"
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    className="h-12 rounded-xl border-gray-200 bg-gray-50 px-4 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    className="h-12 rounded-xl border-gray-200 bg-gray-50 px-4 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm text-gray-600 dark:text-gray-400"
                                >
                                    Remember me for 30 days
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </div>

                        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <TextLink
                                href={register()}
                                tabIndex={5}
                                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            >
                                Sign up for free
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 rounded-lg bg-green-50 p-4 text-center text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Welcome back',
    description: 'Sign in to your account to continue',
};
