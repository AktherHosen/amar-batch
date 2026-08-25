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
                    <div className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="coaching_name">Coaching Center Name *</Label>
                            <Input
                                id="coaching_name"
                                type="text"
                                name="coaching_name"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="organization"
                                placeholder="e.g., Bright Minds Academy"
                            />
                            <InputError message={errors.coaching_name} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="coaching_email">Center Email</Label>
                                <Input
                                    id="coaching_email"
                                    type="email"
                                    name="coaching_email"
                                    tabIndex={2}
                                    autoComplete="email"
                                    placeholder="center@example.com"
                                />
                                <InputError message={errors.coaching_email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="coaching_phone">Center Phone</Label>
                                <Input
                                    id="coaching_phone"
                                    type="tel"
                                    name="coaching_phone"
                                    tabIndex={3}
                                    autoComplete="tel"
                                    placeholder="+880 1XXX-XXXXXX"
                                />
                                <InputError message={errors.coaching_phone} />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 w-full"
                            tabIndex={4}
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            Create Coaching Center
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}

Onboarding.layout = {
    title: 'Set up your coaching center',
    description: 'Complete your account setup to get started',
};
