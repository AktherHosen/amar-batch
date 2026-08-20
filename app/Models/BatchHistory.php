<?php

namespace App\Models;

use App\Concerns\BelongsToBranch;
use App\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BatchHistory extends Model
{
    use BelongsToBranch, BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'batch_id', 'student_id', 'action', 'action_date', 'user_id', 'notes',
    ];

    public function branchScopeQuery(Builder $query, int $branchId): void
    {
        $query->whereHas('batch', fn ($q) => $q->where('branch_id', $branchId));
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
