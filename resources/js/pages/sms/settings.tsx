import { Head, useForm, usePage } from '@inertiajs/react';
import { Bell, MessageSquare, Save, Settings, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useLocale } from '@/contexts/locale-context';

type SmsSetting = {
    id: number | null;
    provider: string;
    api_key: string;
    sender_id: string | null;
    is_enabled: boolean;
    config: Record<string, unknown> | null;
};

type NotificationSchedule = {
    id: number | null;
    type: string;
    is_enabled: boolean;
    config: Record<string, unknown> | null;
    last_run_at: string | null;
};

type PageProps = {
    setting: SmsSetting;
    schedules: NotificationSchedule[];
    balance: number | null;
};

export default function SmsSettings({ setting, schedules, balance }: PageProps) {
    const { t } = useLocale();
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    const { data, setData, post, processing } = useForm({
        provider: setting.provider || 'alpha_sms',
        api_key: setting.api_key || '',
        sender_id: setting.sender_id || '',
        is_enabled: setting.is_enabled || false,
    });

    const feeSchedule = schedules.find((s) => s.type === 'fee_reminder');
    const absenceSchedule = schedules.find((s) => s.type === 'absence_alert');
    const examSchedule = schedules.find((s) => s.type === 'exam_reminder');

    const { data: scheduleData, setData: setScheduleData, post: postSchedule, processing: scheduleProcessing } = useForm({
        schedules: {
            fee_reminder: {
                is_enabled: feeSchedule?.is_enabled ?? true,
                config: { days_before: (feeSchedule?.config as any)?.days_before ?? 7 },
            },
            absence_alert: {
                is_enabled: absenceSchedule?.is_enabled ?? true,
                config: {},
            },
            exam_reminder: {
                is_enabled: examSchedule?.is_enabled ?? true,
                config: { days_before: (examSchedule?.config as any)?.days_before ?? 3 },
            },
        },
    });

    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);

    const updateSchedule = (type: 'fee_reminder' | 'absence_alert' | 'exam_reminder', field: string, value: any) => {
        setScheduleData('schedules', {
            ...scheduleData.schedules,
            [type]: {
                ...scheduleData.schedules[type],
                [field]: value,
            },
        });
    };

    const updateScheduleConfig = (type: 'fee_reminder' | 'exam_reminder', key: string, value: any) => {
        setScheduleData('schedules', {
            ...scheduleData.schedules,
            [type]: {
                ...scheduleData.schedules[type],
                config: {
                    ...scheduleData.schedules[type].config,
                    [key]: value,
                },
            },
        });
    };

    return (
        <>
            <Head title="SMS Settings" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading title="SMS Settings" description="Configure SMS provider and automated notification schedules" />

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Settings className="size-4 text-muted-foreground" />
                                Provider
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <Label className="text-sm font-medium">Enable SMS</Label>
                                    <p className="text-xs text-muted-foreground">Turn on/off SMS notifications</p>
                                </div>
                                <Switch
                                    checked={data.is_enabled}
                                    onCheckedChange={(checked) => setData('is_enabled', checked)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm">Provider</Label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.provider}
                                    onChange={(e) => setData('provider', e.target.value)}
                                >
                                    <option value="alpha_sms">Alpha SMS (sms.net.bd)</option>
                                    <option value="esms">eSMS (esms.com.bd)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm">API Key</Label>
                                <Input
                                    type="password"
                                    value={data.api_key}
                                    onChange={(e) => setData('api_key', e.target.value)}
                                    placeholder="Enter your API key"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm">Sender ID <span className="text-muted-foreground">(optional)</span></Label>
                                <Input
                                    value={data.sender_id}
                                    onChange={(e) => setData('sender_id', e.target.value)}
                                    placeholder="e.g. MyCoaching"
                                    maxLength={11}
                                />
                                <p className="text-xs text-muted-foreground">Max 11 characters. Leave empty for default.</p>
                            </div>

                            <Button onClick={() => post('/sms/settings')} disabled={processing} className="w-full">
                                <Save className="mr-2 size-4" />
                                {processing ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        {balance !== null && (
                            <Card>
                                <CardContent className="flex items-center gap-4 p-4">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                        <Wallet className="size-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">SMS Balance</p>
                                        <p className="text-2xl font-bold">{balance.toLocaleString()}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Bell className="size-4 text-muted-foreground" />
                                    Automated Notifications
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="rounded-lg border p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-500/10">
                                                <MessageSquare className="size-4 text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Fee Reminders</p>
                                                <p className="text-xs text-muted-foreground">Remind parents about unpaid fees</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={scheduleData.schedules.fee_reminder.is_enabled}
                                            onCheckedChange={(checked) => updateSchedule('fee_reminder', 'is_enabled', checked)}
                                        />
                                    </div>
                                    {scheduleData.schedules.fee_reminder.is_enabled && (
                                        <div className="mt-3 ml-11 flex items-center gap-2 text-sm">
                                            <span className="text-muted-foreground">Send</span>
                                            <Input
                                                type="number"
                                                className="h-8 w-16 text-center"
                                                value={scheduleData.schedules.fee_reminder.config.days_before}
                                                onChange={(e) => updateScheduleConfig('fee_reminder', 'days_before', Number(e.target.value))}
                                                min={1}
                                                max={30}
                                            />
                                            <span className="text-muted-foreground">days before due</span>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-lg border p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-red-500/10">
                                                <MessageSquare className="size-4 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Absence Alerts</p>
                                                <p className="text-xs text-muted-foreground">Notify when student is absent</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={scheduleData.schedules.absence_alert.is_enabled}
                                            onCheckedChange={(checked) => updateSchedule('absence_alert', 'is_enabled', checked)}
                                        />
                                    </div>
                                </div>

                                <div className="rounded-lg border p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-green-500/10">
                                                <MessageSquare className="size-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Exam Reminders</p>
                                                <p className="text-xs text-muted-foreground">Remind about upcoming exams</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={scheduleData.schedules.exam_reminder.is_enabled}
                                            onCheckedChange={(checked) => updateSchedule('exam_reminder', 'is_enabled', checked)}
                                        />
                                    </div>
                                    {scheduleData.schedules.exam_reminder.is_enabled && (
                                        <div className="mt-3 ml-11 flex items-center gap-2 text-sm">
                                            <span className="text-muted-foreground">Send</span>
                                            <Input
                                                type="number"
                                                className="h-8 w-16 text-center"
                                                value={scheduleData.schedules.exam_reminder.config.days_before}
                                                onChange={(e) => updateScheduleConfig('exam_reminder', 'days_before', Number(e.target.value))}
                                                min={1}
                                                max={14}
                                            />
                                            <span className="text-muted-foreground">days before exam</span>
                                        </div>
                                    )}
                                </div>

                                <Button onClick={() => postSchedule('/sms/schedules')} disabled={scheduleProcessing} className="w-full">
                                    <Save className="mr-2 size-4" />
                                    {scheduleProcessing ? 'Saving...' : 'Save Schedules'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
