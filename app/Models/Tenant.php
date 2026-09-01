<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'email', 'phone', 'address', 'logo',
        'timezone', 'currency', 'currency_symbol', 'academic_year',
        'receipt_prefix', 'student_id_prefix', 'default_attendance',
        'invoice_footer', 'primary_color', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /** @return HasOne<Subscription, $this> */
    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class);
    }

    /** @return BelongsToMany<User, $this> */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'tenant_user', 'tenant_id', 'user_id')
            ->withPivot('role', 'is_approved')
            ->withTimestamps();
    }

    /** @return HasMany<Student, $this> */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    /** @return HasMany<Role, $this> */
    public function roles(): HasMany
    {
        return $this->hasMany(Role::class);
    }

    /** @return HasMany<Batch, $this> */
    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class);
    }

    /** @return HasMany<CoachingClass, $this> */
    public function coachingClasses(): HasMany
    {
        return $this->hasMany(CoachingClass::class);
    }

    public function isActive(): bool
    {
        return $this->is_active;
    }
}
