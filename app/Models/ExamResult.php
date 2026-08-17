<?php

namespace App\Models;

use App\Concerns\BelongsToBranch;
use App\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamResult extends Model
{
    use BelongsToBranch, BelongsToTenant, HasFactory;

    protected $fillable = [
        'tenant_id', 'exam_id', 'student_id', 'marks_obtained', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'marks_obtained' => 'integer',
        ];
    }

    public function branchScopeQuery(Builder $query, int $branchId): void
    {
        $query->whereHas('exam', fn ($q) => $q->whereHas('batch', fn ($q2) => $q2->where('branch_id', $branchId)));
    }

    /** @return BelongsTo<Exam, $this> */
    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    /** @return BelongsTo<Student, $this> */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
