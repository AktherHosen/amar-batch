<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'description', 'price_monthly', 'price_yearly',
        'max_students', 'max_staff', 'max_batches', 'features',
        'is_active', 'is_default',
    ];

    protected function casts(): array
    {
        return [
            'price_monthly' => 'decimal:2',
            'price_yearly' => 'decimal:2',
            'max_students' => 'integer',
            'max_staff' => 'integer',
            'max_batches' => 'integer',
            'features' => 'array',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
        ];
    }

    /** @return HasMany<Payment, $this> */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function isDefault(): bool
    {
        return $this->is_default;
    }

    public function hasFeature(string $feature): bool
    {
        return in_array($feature, $this->features ?? []);
    }
}
