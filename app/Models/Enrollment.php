<?php

namespace App\Models;

use App\Concerns\BelongsToBranch;
use App\Concerns\BelongsToTenant;
use Database\Factories\EnrollmentFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Enrollment extends Model
{
    /** @use HasFactory<EnrollmentFactory> */
    use BelongsToBranch, BelongsToTenant, HasFactory;

    protected $fillable = ['tenant_id', 'student_id', 'batch_id', 'enrolled_at', 'status', 'paused_at', 'resumed_at', 'notes'];

    protected function casts(): array
    {
        return [
            'enrolled_at' => 'datetime',
            'paused_at' => 'datetime',
            'resumed_at' => 'datetime',
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
}
