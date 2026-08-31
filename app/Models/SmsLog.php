<?php

namespace App\Models;

use App\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SmsLog extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'recipient',
        'message',
        'type',
        'status',
        'provider_message_id',
        'provider_response',
        'cost',
    ];

    protected function casts(): array
    {
        return [
            'provider_response' => 'array',
            'cost' => 'integer',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeSentToday($query)
    {
        return $query->whereDate('created_at', now()->toDateString());
    }
}
