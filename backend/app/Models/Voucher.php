<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $table = 'vouchers';
    public $timestamps = true;

    protected $fillable = [
        'kode_voucher',
        'nama_voucher',
        'tipe_diskon',
        'nilai_diskon',
        'min_pembelian',
        'max_diskon',
        'tanggal_mulai',
        'tanggal_selesai',
        'kuota',
        'used_count',
        'is_active',
    ];

    protected $casts = [
        'tanggal_mulai' => 'datetime',
        'tanggal_selesai' => 'datetime',
        'is_active' => 'boolean',
        'nilai_diskon' => 'decimal:2',
        'min_pembelian' => 'decimal:2',
        'max_diskon' => 'decimal:2',
    ];

    public function usages()
    {
        return $this->hasMany(VoucherUsage::class, 'id_voucher');
    }

    /**
     * Check if voucher is still valid and can be used
     */
    public function isValid()
    {
        return $this->is_active
            && now()->between($this->tanggal_mulai, $this->tanggal_selesai)
            && ($this->kuota == 0 || $this->used_count < $this->kuota);
    }

    /**
     * Calculate discount amount based on total price
     */
    public function calculateDiscount($total_price)
    {
        if ($this->tipe_diskon === 'percentage') {
            $discount = ($total_price * $this->nilai_diskon) / 100;
            // Apply max_diskon cap if percentage
            if ($this->max_diskon && $discount > $this->max_diskon) {
                $discount = $this->max_diskon;
            }
            return $discount;
        } else {
            // Fixed discount
            return min($this->nilai_diskon, $total_price);
        }
    }

    /**
     * Check if user has already used this voucher
     */
    public function isUsedBy($userId)
    {
        return $this->usages()->where('id_pengguna', $userId)->exists();
    }
}
