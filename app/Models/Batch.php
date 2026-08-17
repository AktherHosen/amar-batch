<?php

namespace App\Models;

use App\Concerns\BelongsToBranch;
use App\Concerns\BelongsToTenant;
use Database\Factories\BatchFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Batch extends Model
{
    /** @use HasFactory<BatchFactory> */
    use BelongsToBranch, BelongsToTenant, HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'branch_id', 'name', 'subject', 'days', 'time', 'capacity', 'start_date',
        'end_date', 'status',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
        ];
    }

    /** @return BelongsToMany<User, $this> */
    public function teachers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'teacher_batch', 'batch_id', 'teacher_id')
            ->withPivot('assigned_at')
            ->withTimestamps();
    }

    /** @return HasMany<Enrollment, $this> */
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    /** @return BelongsToMany<Student, $this> */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'enrollments')
            ->withPivot('status', 'enrolled_at')
            ->withTimestamps();
    }

    /** @return HasMany<FeeStatus, $this> */
    public function feeStatuses(): HasMany
    {
        return $this->hasMany(FeeStatus::class);
    }

    /** @return HasMany<Attendance, $this> */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    /** @return HasMany<BatchHistory, $this> */
    public function history(): HasMany
    {
        return $this->hasMany(BatchHistory::class)->latest();
    }

    public function enrolledCount(): int
    {
        return $this->enrollments()->where('status', 'active')->count();
    }
}
