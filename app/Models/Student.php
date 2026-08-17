<?php

namespace App\Models;

use App\Concerns\BelongsToBranch;
use App\Concerns\BelongsToTenant;
use Database\Factories\StudentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    /** @use HasFactory<StudentFactory> */
    use BelongsToBranch, BelongsToTenant, HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'branch_id', 'name', 'phone', 'coaching_class_id', 'section', 'address', 'date_of_birth',
        'gender', 'guardian_name', 'guardian_phone', 'photo', 'status', 'joined_at', 'left_at',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'joined_at' => 'date',
            'left_at' => 'date',
        ];
    }

    /** @return BelongsTo<CoachingClass, $this> */
    public function coachingClass(): BelongsTo
    {
        return $this->belongsTo(CoachingClass::class);
    }

    /** @return HasMany<Enrollment, $this> */
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    /** @return BelongsToMany<Batch, $this> */
    public function batches(): BelongsToMany
    {
        return $this->belongsToMany(Batch::class, 'enrollments')
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
}
