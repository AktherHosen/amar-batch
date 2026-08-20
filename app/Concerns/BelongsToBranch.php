<?php

namespace App\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Scopes a model to the current user's branch.
 *
 * The active branch id is resolved from the container (bound by
 * TenantMiddleware from the authenticated user). Models that carry a
 * `branch_id` column are filtered directly; models without the column can
 * override `branchScopeQuery()` to scope through a related branch-scoped
 * model (e.g. `whereHas('batch')`).
 *
 * @mixin Model
 */
trait BelongsToBranch
{
    public static function bootBelongsToBranch(): void
    {
        static::creating(function (Model $model) {
            $branchId = app()->bound('branch_id') ? app('branch_id') : null;

            if ($branchId && $model->isFillable('branch_id') && is_null($model->branch_id)) {
                $model->branch_id = $branchId;
            }
        });

        static::addGlobalScope('branch', function (Builder $builder) {
            $branchId = app()->bound('branch_id') ? app('branch_id') : null;

            if ($branchId) {
                $model = $builder->getModel();
                $model->branchScopeQuery($builder, (int) $branchId);
            }
        });
    }

    public function branchScopeQuery(Builder $query, int $branchId): void
    {
        $query->where($query->getModel()->getTable().'.branch_id', $branchId);
    }

    public function scopeForBranch(Builder $query, ?int $branchId = null): Builder
    {
        $branchId ??= app()->bound('branch_id') ? app('branch_id') : null;

        return $branchId
            ? $query->where($query->getModel()->getTable().'.branch_id', $branchId)
            : $query;
    }
}