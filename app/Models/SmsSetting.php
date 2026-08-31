<?php

namespace App\Models;

use App\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class SmsSetting extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'provider',
        'api_key',
        'sender_id',
        'is_enabled',
        'config',
    ];

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'config' => 'array',
        ];
    }

    public static function forTenant(int $tenantId): ?self
    {
        return static::where('tenant_id', $tenantId)->first();
    }

    public static function getForTenant(int $tenantId): self
    {
        return static::forTenant($tenantId) ?? new static(['tenant_id' => $tenantId]);
    }
}
