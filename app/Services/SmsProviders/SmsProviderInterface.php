<?php

namespace App\Services\SmsProviders;

interface SmsProviderInterface
{
    public function send(string $to, string $message): array;

    public function getBalance(): int;
}
