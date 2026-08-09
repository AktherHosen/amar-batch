import { Head } from '@inertiajs/react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PublicLayout from '@/layouts/public-layout';
import { useLocale } from '@/contexts/locale-context';

export default function Contact() {
    const { t } = useLocale();

    const contactInfo = [
        {
            icon: Mail,
            title: t('contact.email'),
            value: 'support@amarbatch.com',
        },
        {
            icon: Phone,
            title: t('contact.phone'),
            value: '+880 1XXX-XXXXXX',
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

    return (
        <PublicLayout>
            <Head title={t('contact.page_title')} />

            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
                <div className="mb-10">
                    <h1 className="mb-4 text-3xl font-bold sm:text-4xl">
                        {t('contact.page_title')}
                    </h1>
                    <p className="max-w-2xl text-lg text-muted-foreground">
                        {t('contact.page_desc')}
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Contact Info */}
                    <div className="space-y-4">
                        {contactInfo.map((item) => (
                            <Card key={item.title}>
                                <CardContent className="flex items-start gap-4 py-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground">{item.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('contact.form_title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">{t('contact.form_name')}</Label>
                                    <Input id="name" placeholder="Your name" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">{t('contact.form_email')}</Label>
                                    <Input id="email" type="email" placeholder="you@example.com" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="subject">{t('contact.form_subject')}</Label>
                                    <Input id="subject" placeholder="How can we help?" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="message">{t('contact.form_message')}</Label>
                                    <Textarea id="message" rows={4} placeholder="Your message..." />
                                </div>
                                <Button type="submit" className="w-full">
                                    <Send className="mr-2 h-4 w-4" />
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
