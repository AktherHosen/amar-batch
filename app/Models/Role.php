<?php

namespace App\Models;

use App\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Role extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'tenant_id', 'name', 'slug', 'description', 'permissions', 'is_system',
    ];

    protected function casts(): array
    {
        return [
            'permissions' => 'array',
            'is_system' => 'boolean',
        ];
    }

    /** @return HasMany<User, $this> */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'role', 'slug');
    }

    public function hasRoute(string $routeName): bool
    {
        $permissions = $this->permissions ?? [];

        if (in_array('*', $permissions, true)) {
            return true;
        }

        foreach ($permissions as $permission) {
            if (Str::is($permission, $routeName)) {
                return true;
            }
        }

        return false;
    }
}