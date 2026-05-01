<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug', 'icon', 'description', 'is_active'])]
class Category extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function gears(): HasMany
    {
        return $this->hasMany(Gear::class);
    }

    public function gearStandards(): HasMany
    {
        return $this->hasMany(GearStandard::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
