<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoucherUsage extends Model
{
    protected $table = 'voucher_usages';
    public $timestamps = true;

    protected $fillable = [
        'id_voucher',
        'id_pengguna',
        'id_transaksi',
        'diskon_dapat',
        'total_setelah_diskon',
    ];

    protected $casts = [
        'diskon_dapat' => 'decimal:2',
        'total_setelah_diskon' => 'decimal:2',
    ];

    public function voucher()
    {
        return $this->belongsTo(Voucher::class, 'id_voucher', 'id');
    }

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'id_pengguna', 'id_pengguna');
    }

    public function transaksi()
    {
        return $this->belongsTo(Transaksi::class, 'id_transaksi', 'id_transaksi');
    }
}
