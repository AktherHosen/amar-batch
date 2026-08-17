<?php

namespace App\Models;

use App\Concerns\BelongsToTenant;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use BelongsToTenant, HasApiTokens, HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'tenant_id', 'branch_id', 'phone', 'avatar',
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

    /** @return BelongsTo<Tenant, $this> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
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
            ->where('batches.tenant_id', $this->tenant_id)
            ->withPivot('assigned_at')
            ->withTimestamps();
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
        return $this->role === 'teacher';
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
