<?php

namespace App\Services\SmsProviders;

use Illuminate\Support\Facades\Http;

class AlphaSmsProvider implements SmsProviderInterface
{
    private string $apiKey;
    private ?string $senderId;
    private string $endpoint = 'https://api.sms.net.bd/sendsms';

    public function __construct(string $apiKey, ?string $senderId = null)
    {
        $this->apiKey = $apiKey;
        $this->senderId = $senderId;
    }

    public function send(string $to, string $message): array
    {
        $payload = [
            'api_key' => $this->apiKey,
            'msg' => $message,
            'to' => $to,
        ];

        if ($this->senderId) {
            $payload['sender_id'] = $this->senderId;
        }

        $response = Http::timeout(30)->post($this->endpoint, $payload);

        $data = $response->json();

        if ($response->successful() && ($data['error'] ?? null) === '0') {
            return [
                'success' => true,
                'message_id' => $data['msg_id'] ?? null,
                'balance' => $data['balance'] ?? null,
                'raw' => $data,
            ];
        }

        return [
            'success' => false,
            'error' => $data['msg'] ?? $data['error'] ?? 'Unknown error',
            'error_code' => $data['error'] ?? null,
            'raw' => $data,
        ];
    }

    public function getBalance(): int
    {
        $response = Http::timeout(15)->get("https://api.sms.net.bd/user/balance/?api_key={$this->apiKey}");

        $data = $response->json();

        return (int) ($data['balance'] ?? 0);
    }
}
