<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'branch_id', 'phone', 'avatar',
        'student_id', 'is_approved', 'onboarding_complete',
    ];

    protected $hidden = [
        'password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token',
    ];

    protected $appends = [
        'permissions',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_approved' => 'boolean',
            'onboarding_complete' => 'boolean',
        ];
    }

    /** @return BelongsToMany<Tenant, $this> */
    public function tenants(): BelongsToMany
    {
        return $this->belongsToMany(Tenant::class, 'tenant_user', 'user_id', 'tenant_id')
            ->withPivot('role', 'is_approved')
            ->withTimestamps();
    }

    /**
     * Get the current active tenant from the application container.
     */
    public function getCurrentTenantAttribute(): ?Tenant
    {
        $tenantId = app()->bound('tenant_id') ? app('tenant_id') : null;

        return $tenantId ? $this->tenants()->find($tenantId) : $this->tenants()->first();
    }

    /**
     * Check if the user belongs to a given tenant.
     */
    public function belongsToTenant(int $tenantId): bool
    {
        return $this->tenants()->where('tenant_id', $tenantId)->exists();
    }

    /** @return BelongsTo<Branch, $this> */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Whether this user should be restricted to a single branch's data.
     */
    public function isBranchScoped(): bool
    {
        return ! $this->isOwner() && ! $this->isSuperAdmin() && ! is_null($this->branch_id);
    }

    /** @return BelongsTo<Student, $this> */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /** @return BelongsToMany<Batch, $this> */
    public function assignedBatches(): BelongsToMany
    {
        return $this->belongsToMany(Batch::class, 'teacher_batch', 'teacher_id', 'batch_id')
            ->withoutGlobalScope('tenant')
            ->withoutGlobalScope('branch')
            ->where('batches.tenant_id', app()->bound('tenant_id') ? app('tenant_id') : null)
            ->withPivot('assigned_at')
            ->withTimestamps();
    }

    /** @return HasOne<UserSetting, $this> */
    public function settings(): HasOne
    {
        return $this->hasOne(UserSetting::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    public function isStaff(): bool
    {
        return $this->role === 'staff';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function isParent(): bool
    {
        return $this->role === 'parent';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'super_admin' || $this->role === 'owner';
    }

    public function isTeacher(): bool
    {
        return in_array($this->role, ['teacher', 'staff'], true);
    }

    public function isApproved(): bool
    {
        return $this->is_approved;
    }

    /**
     * The resolved route permissions for the user's role.
     * Owners and super admins have wildcard access.
     *
     * @return array<string>
     */
    public function routePermissions(): array
    {
        if ($this->isSuperAdmin() || $this->isOwner()) {
            return ['*'];
        }

        $permissions = Role::query()
            ->where('slug', $this->role)
            ->value('permissions');

        // Teachers are staff-type users; fall back to the staff role when no
        // dedicated teacher role row exists yet.
        if (is_null($permissions) && $this->isTeacher()) {
            $permissions = Role::query()
                ->where('slug', 'staff')
                ->value('permissions');
        }

        return is_array($permissions) ? $permissions : [];
    }

    /**
     * Accessor so route permissions are serialized with the user (used by the
     * sidebar and UI gating).
     *
     * @return array<string>
     */
    public function getPermissionsAttribute(): array
    {
        return $this->routePermissions();
    }

    public function hasRoutePermission(string $routeName): bool
    {
        if ($this->isSuperAdmin() || $this->isOwner()) {
            return true;
        }

        $role = Role::query()->where('slug', $this->role)->first();

        if (! $role && $this->isTeacher()) {
            $role = Role::query()->where('slug', 'staff')->first();
        }

        return $role ? $role->hasRoute($routeName) : false;
    }
}
