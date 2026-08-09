<?php

namespace App\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * @mixin Model
 */
trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::creating(function (Model $model) {
            $tenantId = app()->bound('tenant_id') ? app('tenant_id') : null;
            if (is_null($model->tenant_id) && $tenantId) {
                $model->tenant_id = $tenantId;
            }
        });

        static::addGlobalScope('tenant', function (Builder $builder) {
            $tenantId = app()->bound('tenant_id') ? app('tenant_id') : null;
            if ($tenantId) {
                $builder->where($builder->getModel()->getTable() . '.tenant_id', $tenantId);
            }
        });
    }

    public function scopeForCurrentTenant(Builder $query): Builder
    {
        $tenantId = app()->bound('tenant_id') ? app('tenant_id') : null;

        return $query->where($query->getModel()->getTable() . '.tenant_id', $tenantId);
    }

    public function scopeForTenant(Builder $query, int $tenantId): Builder
    {
        return $query->where($query->getModel()->getTable() . '.tenant_id', $tenantId);
    }
}
