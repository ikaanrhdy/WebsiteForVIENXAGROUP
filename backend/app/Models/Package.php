<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Package extends Model
{
    protected $fillable = ['name', 'slug', 'audience', 'description', 'features', 'price', 'featured', 'is_active', 'sort_order'];

    protected function casts(): array
    {
        return [
            'features' => 'array',
            'price' => 'integer',
            'featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Package $package) {
            if (blank($package->slug)) {
                $base = Str::slug($package->name) ?: 'paket';
                $slug = $base;
                for ($i = 2; static::where('slug', $slug)->exists(); $i++) {
                    $slug = "$base-$i";
                }
                $package->slug = $slug;
            }
        });
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
