<?php

namespace App\Models;

use App\Concerns\BelongsToBranch;
use App\Concerns\BelongsToTenant;
use Database\Factories\AttendanceFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    /** @use HasFactory<AttendanceFactory> */
    use BelongsToBranch, BelongsToTenant, HasFactory;

    protected $fillable = ['tenant_id', 'student_id', 'batch_id', 'marked_by', 'date', 'status', 'notes'];

    protected function casts(): array
    {
        return ['date' => 'date'];
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

    /** @return BelongsTo<User, $this> */
    public function markedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'marked_by');
    }
}
