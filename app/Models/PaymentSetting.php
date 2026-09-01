<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentSetting extends Model
{
    protected $fillable = [
        'gateway',
        'sandbox',
        'store_id',
        'store_password',
        'currency',
        'manual_payment_enabled',
        'manual_payment_instructions',
        'metadata',
    ];

    protected $casts = [
        'sandbox' => 'boolean',
        'manual_payment_enabled' => 'boolean',
        'metadata' => 'array',
    ];

    public static function forGateway(string $gateway = 'sslcommerz'): ?static
    {
        return static::where('gateway', $gateway)->first();
    }

    public static function getForGateway(string $gateway = 'sslcommerz'): static
    {
        return static::forGateway($gateway) ?? static::create(['gateway' => $gateway]);
    }
}
