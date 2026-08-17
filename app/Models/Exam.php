<?php

namespace App\Models;

use App\Concerns\BelongsToBranch;
use App\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
{
    use BelongsToBranch, BelongsToTenant, HasFactory;

    protected $fillable = [
        'tenant_id', 'title', 'subject', 'batch_id', 'date',
        'total_marks', 'passing_marks', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'total_marks' => 'integer',
            'passing_marks' => 'integer',
        ];
    }

    public function branchScopeQuery(Builder $query, int $branchId): void
    {
        $query->whereHas('batch', fn ($q) => $q->where('branch_id', $branchId));
    }

    /** @return BelongsTo<Batch, $this> */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    /** @return HasMany<ExamResult, $this> */
    public function results(): HasMany
    {
        return $this->hasMany(ExamResult::class);
    }
}
