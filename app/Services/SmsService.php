<?php

namespace App\Services;

use App\Models\SmsLog;
use App\Models\SmsSetting;
use App\Services\SmsProviders\AlphaSmsProvider;
use App\Services\SmsProviders\EsmsProvider;
use App\Services\SmsProviders\SmsProviderInterface;

class SmsService
{
    private ?SmsSetting $setting;
    private SmsProviderInterface $provider;

    public function __construct(?int $tenantId = null)
    {
        $this->setting = $tenantId ? SmsSetting::forTenant($tenantId) : null;

        if ($this->setting && $this->setting->is_enabled) {
            $this->provider = $this->resolveProvider($this->setting);
        }
    }

    public function isAvailable(): bool
    {
        return $this->setting && $this->setting->is_enabled && isset($this->provider);
    }

    public function send(string $to, string $string, string $type = 'manual', ?int $userId = null): SmsLog
    {
        $tenantId = $this->setting?->tenant_id ?? app('tenant_id');

        $log = SmsLog::create([
            'tenant_id' => $tenantId,
            'user_id' => $userId,
            'recipient' => $this->normalizePhone($to),
            'message' => $string,
            'type' => $type,
            'status' => 'pending',
        ]);

        if (! $this->isAvailable()) {
            $log->update(['status' => 'failed', 'provider_response' => ['error' => 'SMS service not configured or disabled']]);

            return $log;
        }

        try {
            $response = $this->provider->send($this->normalizePhone($to), $string);

            $log->update([
                'status' => $response['success'] ? 'sent' : 'failed',
                'provider_message_id' => $response['message_id'] ?? null,
                'provider_response' => $response,
            ]);
        } catch (\Exception $e) {
            $log->update([
                'status' => 'failed',
                'provider_response' => ['error' => $e->getMessage()],
            ]);
        }

        return $log;
    }

    public function sendBulk(array $recipients, string $string, string $type = 'manual', ?int $userId = null): array
    {
        $logs = [];

        foreach ($recipients as $recipient) {
            $phone = is_array($recipient) ? ($recipient['phone'] ?? '') : $recipient;
            if (! empty($phone)) {
                $logs[] = $this->send($phone, $string, $type, $userId);
            }
        }

        return $logs;
    }

    public function getBalance(): ?int
    {
        if (! $this->isAvailable()) {
            return null;
        }

        try {
            return $this->provider->getBalance();
        } catch (\Exception $e) {
            return null;
        }
    }

    private function resolveProvider(SmsSetting $setting): SmsProviderInterface
    {
        return match ($setting->provider) {
            'esms' => new EsmsProvider($setting->api_key, $setting->sender_id),
            default => new AlphaSmsProvider($setting->api_key, $setting->sender_id),
        };
    }

    private function normalizePhone(string $phone): string
    {
        $phone = trim($phone);

        if (str_starts_with($phone, '0')) {
            return '880' . substr($phone, 1);
        }

        if (str_starts_with($phone, '+880')) {
            return substr($phone, 1);
        }

        if (str_starts_with($phone, '880')) {
            return $phone;
        }

        return $phone;
    }
}
