import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            {/* Coaching Center Section */}
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

                            {/* Owner Account Section */}
                            <div>
                                <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                                    Your Account (Owner)
                                </h3>
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="name"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Full name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    tabIndex={4}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Enter your full name"
                                    className="h-12 rounded-xl border-gray-200 bg-gray-50 px-4 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

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
                                    required
                                    tabIndex={5}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    className="h-12 rounded-xl border-gray-200 bg-gray-50 px-4 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Password
                                </Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={6}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Create a password"
                                    passwordrules={passwordRules}
                                    className="h-12 rounded-xl border-gray-200 bg-gray-50 px-4 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Confirm password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={7}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm your password"
                                    passwordrules={passwordRules}
                                    className="h-12 rounded-xl border-gray-200 bg-gray-50 px-4 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700"
                                tabIndex={8}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create Coaching Center
                            </Button>
                        </div>

                        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={9}
                                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            >
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Create your coaching center',
    description: 'Get started with Karnaphuli Alpha Academy',
};
