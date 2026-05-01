<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'transaction_code',
    'customer_id',
    'destination_id',
    'start_date',
    'end_date',
    'total_cost',
    'deposit_amount',
    'status',
    'actual_return_date',
    'notes',
])]
class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'actual_return_date' => 'date',
            'total_cost' => 'decimal:2',
            'deposit_amount' => 'decimal:2',
        ];
    }

    // ─── Relationships ──────────────────────────────────────────────────

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(TransactionDetail::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function deposit(): HasOne
    {
        return $this->hasOne(Deposit::class);
    }

    // ─── Scopes ─────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['paid', 'rented']);
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'rented')
            ->where('end_date', '<', now());
    }

    // ─── Helpers ────────────────────────────────────────────────────────

    public static function generateCode(): string
    {
        $latest = static::withTrashed()
            ->orderByDesc('id')
            ->first();

        $nextNumber = $latest ? ((int) substr($latest->transaction_code, 4)) + 1 : 1;

        return 'TRX-' . str_pad((string) $nextNumber, 3, '0', STR_PAD_LEFT);
    }
}
