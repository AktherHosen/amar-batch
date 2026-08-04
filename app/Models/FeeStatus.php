<?php

namespace App\Models;

use Database\Factories\FeeStatusFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeeStatus extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id', 'batch_id', 'month', 'year', 'amount_paid', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount_paid' => 'decimal:2',
            'month' => 'integer',
            'year' => 'integer',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    public function getMonthNameAttribute(): string
    {
        return mktime(0, 0, 0, $this->month, 1)
            ? date('F', mktime(0, 0, 0, $this->month, 1))
            : '';
    }
}
