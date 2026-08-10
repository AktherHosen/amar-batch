<?php

namespace App\Models;

use App\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeeReceipt extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'tenant_id',
        'student_id',
        'batch_id',
        'receipt_number',
        'month',
        'year',
        'amount_paid',
        'amount_due',
        'notes',
        'created_by',
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

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getMonthNameAttribute(): string
    {
        $timestamp = mktime(0, 0, 0, (int) $this->month, 1);
        return is_int($timestamp) ? date('F', $timestamp) : '';
    }

    public static function generateReceiptNumber(): string
    {
        $prefix = 'RCP';
        $date = now()->format('Ymd');
        $lastReceipt = static::where('receipt_number', 'like', "{$prefix}-{$date}-%")
            ->orderByDesc('receipt_number')
            ->first();

        if ($lastReceipt) {
            $sequence = (int) substr($lastReceipt->receipt_number, -4) + 1;
        } else {
            $sequence = 1;
        }

        return sprintf("%s-%s-%04d", $prefix, $date, $sequence);
    }
}
