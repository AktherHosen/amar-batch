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
        'student_id', 'batch_id', 'amount_paid', 'amount_due',
        'due_date', 'status', 'payment_date', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount_paid' => 'decimal:2',
            'amount_due' => 'decimal:2',
            'due_date' => 'date',
            'payment_date' => 'date',
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
}
