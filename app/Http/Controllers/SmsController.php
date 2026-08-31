<?php

namespace App\Http\Controllers;

use App\Models\NotificationSchedule;
use App\Models\SmsLog;
use App\Models\SmsSetting;
use App\Models\Student;
use App\Services\SmsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class SmsController extends Controller
{
    public function settings(): Response
    {
        $tenantId = app('tenant_id');
        $setting = SmsSetting::getForTenant($tenantId);

        $schedules = NotificationSchedule::where('tenant_id', $tenantId)->get();

        $balance = null;
        if ($setting->is_enabled && $setting->api_key) {
            $sms = new SmsService($tenantId);
            $balance = $sms->getBalance();
        }

        return Inertia::render('sms/settings', [
            'setting' => $setting,
            'schedules' => $schedules,
            'balance' => $balance,
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'provider' => 'required|in:alpha_sms,esms',
            'api_key' => 'required|string',
            'sender_id' => 'nullable|string|max:11',
            'is_enabled' => 'boolean',
        ]);

        $tenantId = app('tenant_id');

        SmsSetting::updateOrCreate(
            ['tenant_id' => $tenantId],
            $validated,
        );

        return response()->json(['success' => true]);
    }

    public function updateSchedules(Request $request): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            abort(403);
        }

        $schedules = $request->input('schedules', []);
        $tenantId = app('tenant_id');

        $types = ['fee_reminder', 'absence_alert', 'exam_reminder'];

        foreach ($types as $type) {
            $data = $schedules[$type] ?? ['is_enabled' => false, 'config' => []];

            NotificationSchedule::updateOrCreate(
                ['tenant_id' => $tenantId, 'type' => $type],
                [
                    'is_enabled' => $data['is_enabled'] ?? false,
                    'config' => $data['config'] ?? [],
                ],
            );
        }

        return response()->json(['success' => true]);
    }

    public function sendPage(): Response
    {
        $tenantId = app('tenant_id');

        $students = Student::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->with('coachingClass')
            ->orderBy('name')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'phone' => $s->phone,
                'coaching_class' => $s->coachingClass?->name,
            ]);

        return Inertia::render('sms/send', [
            'students' => $students,
        ]);
    }

    public function send(Request $request): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'recipients' => 'required|array|min:1',
            'recipients.*' => 'required|string',
            'message' => 'required|string|max:1000',
        ]);

        $tenantId = app('tenant_id');
        $sms = new SmsService($tenantId);

        if (! $sms->isAvailable()) {
            return response()->json(['error' => 'SMS service is not configured or disabled. Please configure it in SMS Settings.'], 422);
        }

        $logs = $sms->sendBulk(
            $validated['recipients'],
            $validated['message'],
            'manual',
            $request->user()->id,
        );

        $sent = collect($logs)->where('status', 'sent')->count();
        $failed = collect($logs)->where('status', 'failed')->count();

        return response()->json([
            'success' => true,
            'sent' => $sent,
            'failed' => $failed,
            'total' => count($logs),
        ]);
    }

    public function logs(Request $request): Response
    {
        $tenantId = app('tenant_id');

        $query = SmsLog::where('tenant_id', $tenantId)
            ->with('user:id,name')
            ->latest();

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('recipient', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $logs = $query->paginate(15)->withQueryString();

        $stats = [
            'total' => SmsLog::where('tenant_id', $tenantId)->count(),
            'sent' => SmsLog::where('tenant_id', $tenantId)->where('status', 'sent')->count(),
            'failed' => SmsLog::where('tenant_id', $tenantId)->where('status', 'failed')->count(),
            'today' => SmsLog::where('tenant_id', $tenantId)->sentToday()->count(),
        ];

        return Inertia::render('sms/logs', [
            'logs' => $logs,
            'stats' => $stats,
            'filters' => $request->only(['type', 'status', 'search']),
        ]);
    }
}
