<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'owner_id',
    'category_id',
    'name',
    'description',
    'rental_price',
    'stock',
    'image',
    'condition',
    'status',
])]
class Gear extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'rental_price' => 'decimal:2',
            'stock' => 'integer',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function transactionDetails(): HasMany
    {
        return $this->hasMany(TransactionDetail::class);
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available')->where('stock', '>', 0);
    }

    public function scopeByOwner($query, int $ownerId)
    {
        return $query->where('owner_id', $ownerId);
    }
}
