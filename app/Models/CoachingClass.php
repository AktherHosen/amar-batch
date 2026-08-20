<?php

namespace App\Models;

use App\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CoachingClass extends Model
{
    use BelongsToTenant;

    protected $fillable = ['tenant_id', 'name', 'default_fee'];

    protected function casts(): array
    {
        return ['default_fee' => 'decimal:2'];
    }

    /** @return HasMany<Student, $this> */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }
}
