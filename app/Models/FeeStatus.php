<?php

namespace App\Models;

use App\Concerns\BelongsToBranch;
use App\Concerns\BelongsToTenant;
use Database\Factories\FeeStatusFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeeStatus extends Model
{
    /** @use HasFactory<FeeStatusFactory> */
    use BelongsToBranch, BelongsToTenant, HasFactory;

    protected $fillable = [
        'tenant_id', 'student_id', 'batch_id', 'month', 'year', 'amount_paid', 'amount_due', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount_paid' => 'decimal:2',
            'amount_due' => 'decimal:2',
            'month' => 'integer',
            'year' => 'integer',
        ];
    }

    public function branchScopeQuery(Builder $query, int $branchId): void
    {
        $query->whereHas('batch', fn ($q) => $q->where('branch_id', $branchId));
    }

    /** @return BelongsTo<Student, $this> */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /** @return BelongsTo<Batch, $this> */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    public function getMonthNameAttribute(): string
    {
        $timestamp = mktime(0, 0, 0, (int) $this->month, 1);

        return is_int($timestamp) ? date('F', $timestamp) : '';
    }
}
