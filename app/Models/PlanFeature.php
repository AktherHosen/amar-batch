<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanFeature extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'is_system',
    ];

    protected $casts = [
        'is_system' => 'boolean',
    ];

    public static function generateSlug(string $name): string
    {
        return \Illuminate\Support\Str::slug($name);
    }
}
