<?php

namespace App\Services\SmsProviders;

use Illuminate\Support\Facades\Http;

class EsmsProvider implements SmsProviderInterface
{
    private string $apiKey;
    private ?string $senderId;
    private string $endpoint = 'https://login.esms.com.bd/api/v3/sms/send';

    public function __construct(string $apiKey, ?string $senderId = null)
    {
        $this->apiKey = $apiKey;
        $this->senderId = $senderId;
    }

    public function send(string $to, string $message): array
    {
        $response = Http::timeout(30)
            ->withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Accept' => 'application/json',
            ])
            ->post($this->endpoint, [
                'recipient' => $to,
                'sender_id' => $this->senderId ?? 'eSMS',
                'type' => 'plain',
                'message' => $message,
            ]);

        $data = $response->json();

        if ($response->successful() && ($data['status'] ?? null) === 'success') {
            return [
                'success' => true,
                'message_id' => $data['data']['uid'] ?? null,
                'raw' => $data,
            ];
        }

        return [
            'success' => false,
            'error' => $data['message'] ?? 'Unknown error',
            'raw' => $data,
        ];
    }

    public function getBalance(): int
    {
        $response = Http::timeout(15)
            ->withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Accept' => 'application/json',
            ])
            ->get('https://login.esms.com.bd/api/v3/user/balance');

        $data = $response->json();

        return (int) ($data['data']['balance'] ?? 0);
    }
}
