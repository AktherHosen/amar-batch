<?php

namespace App\Models;

use App\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class NotificationSchedule extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'type',
        'is_enabled',
        'config',
        'last_run_at',
    ];

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'config' => 'array',
            'last_run_at' => 'datetime',
        ];
    }

    public static function forType(int $tenantId, string $type): ?self
    {
        return static::where('tenant_id', $tenantId)->where('type', $type)->first();
    }
}
