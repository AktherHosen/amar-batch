import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/contexts/locale-context';
import PublicLayout from '@/layouts/public-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Clock, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function Contact() {
    const { t } = useLocale();

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const contactInfo = [
        {
            icon: Mail,
            title: t('contact.email'),
            value: 'support@amarbatch.com',
        },
        {
            icon: Phone,
            title: t('contact.phone'),
            value: '+880 1610-945101',
        },
        {
            icon: MapPin,
            title: t('contact.address'),
            value: t('contact.address_value'),
        },
        {
            icon: Clock,
            title: t('contact.hours'),
            value: t('contact.hours_value'),
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/contact', {
            onSuccess: () => {
                toast.success(t('contact.sent_success'));
                reset();
            },
            onError: (errs) => {
                toast.error(Object.values(errs)[0] || t('contact.sent_error'));
            },
        });
    };

    return (
        <PublicLayout>
            <Head title={t('contact.page_title')} />

            <div className="mx-auto max-w-4xl px-3 py-8 sm:px-6 sm:py-16 lg:py-20">
                <div className="mb-6 sm:mb-10">
                    <h1 className="mb-3 text-2xl font-bold tracking-tight sm:mb-4 sm:text-4xl">
                        {t('contact.page_title')}
                    </h1>
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
                        {t('contact.page_desc')}
                    </p>
                </div>

                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                    {/* Contact Info */}
                    <div className="space-y-3 sm:space-y-4">
                        {contactInfo.map((item) => (
                            <Card key={item.title}>
                                <CardContent className="flex items-start gap-3 py-3 sm:gap-4 sm:py-4">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-10 sm:w-10">
                                        <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold sm:text-base">
                                            {item.title}
                                        </h3>
                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                            {item.value}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <Card>
                        <CardContent className="pt-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        {t('contact.form_name')}
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Your name"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        {t('contact.form_email')}
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="subject">
                                        {t('contact.form_subject')}
                                    </Label>
                                    <Input
                                        id="subject"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        placeholder="How can we help?"
                                        required
                                    />
                                    {errors.subject && (
                                        <p className="text-sm text-red-600">{errors.subject}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="message">
                                        {t('contact.form_message')}
                                    </Label>
                                    <Textarea
                                        id="message"
                                        rows={4}
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        placeholder="Your message..."
                                        required
                                    />
                                    {errors.message && (
                                        <p className="text-sm text-red-600">{errors.message}</p>
                                    )}
                                </div>
                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="mr-2 h-4 w-4" />
                                    )}
                                    {t('contact.form_submit')}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PublicLayout>
    );
}