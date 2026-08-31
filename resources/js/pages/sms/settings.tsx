import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Bell, MessageSquare, Save, Settings } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
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
                config: {
                    days_before: (feeSchedule?.config as any)?.days_before ?? 7,
                },
            },
            absence_alert: {
                is_enabled: absenceSchedule?.is_enabled ?? true,
                config: {},
            },
            exam_reminder: {
                is_enabled: examSchedule?.is_enabled ?? true,
                config: {
                    days_before: (examSchedule?.config as any)?.days_before ?? 3,
                },
            },
        },
    });

    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);

    const handleSaveSettings = () => {
        post('/dashboard/sms/settings', {
            onSuccess: () => toast.success(t('toast.updated_successfully')),
        });
    };

    const handleSaveSchedules = () => {
        postSchedule('/dashboard/sms/schedules', {
            onSuccess: () => toast.success(t('toast.updated_successfully')),
        });
    };

    return (
        <>
            <Head title="SMS Settings" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading title="SMS Settings" description="Configure SMS provider and notification schedules" />

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Settings className="size-4 text-muted-foreground" />
                                Provider Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Enable SMS</Label>
                                    <p className="text-xs text-muted-foreground">Turn on/off SMS notifications</p>
                                </div>
                                <Switch
                                    checked={data.is_enabled}
                                    onCheckedChange={(checked) => setData('is_enabled', checked)}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label>Provider</Label>
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
                                <Label>API Key</Label>
                                <Input
                                    type="password"
                                    value={data.api_key}
                                    onChange={(e) => setData('api_key', e.target.value)}
                                    placeholder="Enter your API key"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Sender ID (optional)</Label>
                                <Input
                                    value={data.sender_id}
                                    onChange={(e) => setData('sender_id', e.target.value)}
                                    placeholder="e.g. MyCoaching"
                                    maxLength={11}
                                />
                                <p className="text-xs text-muted-foreground">Max 11 characters. Leave empty for default.</p>
                            </div>

                            <Button onClick={handleSaveSettings} disabled={processing} className="w-full">
                                <Save className="mr-2 size-4" />
                                {processing ? 'Saving...' : 'Save Settings'}
                            </Button>

                            {balance !== null && (
                                <div className="rounded-lg border p-3 text-center">
                                    <p className="text-xs text-muted-foreground">SMS Balance</p>
                                    <p className="text-lg font-bold">{balance.toLocaleString()}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Bell className="size-4 text-muted-foreground" />
                                Notification Schedules
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="size-4 text-blue-600" />
                                        <div>
                                            <p className="text-sm font-medium">Fee Reminders</p>
                                            <p className="text-xs text-muted-foreground">Remind parents about unpaid fees</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={scheduleData.schedules.fee_reminder.is_enabled}
                                        onCheckedChange={(checked) =>
                                            setScheduleData('schedules', {
                                                ...scheduleData.schedules,
                                                fee_reminder: {
                                                    ...scheduleData.schedules.fee_reminder,
                                                    is_enabled: checked,
                                                },
                                            })
                                        }
                                    />
                                </div>
                                {scheduleData.schedules.fee_reminder.is_enabled && (
                                    <div className="ml-7 flex items-center gap-2">
                                        <Label className="text-xs">Send</Label>
                                        <Input
                                            type="number"
                                            className="h-8 w-16 text-center"
                                            value={scheduleData.schedules.fee_reminder.config.days_before}
                                            onChange={(e) =>
                                                setScheduleData('schedules', {
                                                    ...scheduleData.schedules,
                                                    fee_reminder: {
                                                        ...scheduleData.schedules.fee_reminder,
                                                        config: {
                                                            ...scheduleData.schedules.fee_reminder.config,
                                                            days_before: Number(e.target.value),
                                                        },
                                                    },
                                                })
                                            }
                                            min={1}
                                            max={30}
                                        />
                                        <Label className="text-xs">days before due</Label>
                                    </div>
                                )}

                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="size-4 text-red-600" />
                                        <div>
                                            <p className="text-sm font-medium">Absence Alerts</p>
                                            <p className="text-xs text-muted-foreground">Notify when student is absent</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={scheduleData.schedules.absence_alert.is_enabled}
                                        onCheckedChange={(checked) =>
                                            setScheduleData('schedules', {
                                                ...scheduleData.schedules,
                                                absence_alert: {
                                                    ...scheduleData.schedules.absence_alert,
                                                    is_enabled: checked,
                                                },
                                            })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="size-4 text-green-600" />
                                        <div>
                                            <p className="text-sm font-medium">Exam Reminders</p>
                                            <p className="text-xs text-muted-foreground">Remind about upcoming exams</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={scheduleData.schedules.exam_reminder.is_enabled}
                                        onCheckedChange={(checked) =>
                                            setScheduleData('schedules', {
                                                ...scheduleData.schedules,
                                                exam_reminder: {
                                                    ...scheduleData.schedules.exam_reminder,
                                                    is_enabled: checked,
                                                },
                                            })
                                        }
                                    />
                                </div>
                                {scheduleData.schedules.exam_reminder.is_enabled && (
                                    <div className="ml-7 flex items-center gap-2">
                                        <Label className="text-xs">Send</Label>
                                        <Input
                                            type="number"
                                            className="h-8 w-16 text-center"
                                            value={scheduleData.schedules.exam_reminder.config.days_before}
                                            onChange={(e) =>
                                                setScheduleData('schedules', {
                                                    ...scheduleData.schedules,
                                                    exam_reminder: {
                                                        ...scheduleData.schedules.exam_reminder,
                                                        config: {
                                                            ...scheduleData.schedules.exam_reminder.config,
                                                            days_before: Number(e.target.value),
                                                        },
                                                    },
                                                })
                                            }
                                            min={1}
                                            max={14}
                                        />
                                        <Label className="text-xs">days before exam</Label>
                                    </div>
                                )}
                            </div>

                            <Button onClick={handleSaveSchedules} disabled={scheduleProcessing} className="w-full">
                                <Save className="mr-2 size-4" />
                                {scheduleProcessing ? 'Saving...' : 'Save Schedules'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
