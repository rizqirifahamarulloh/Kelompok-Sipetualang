<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengajuanPengembalian extends Model
{
    protected $table = 'pengajuan_pengembalian';
    protected $primaryKey = 'id_pengajuan';

    protected $fillable = [
        'id_transaksi',
        'id_customer',
        'alasan',
        'foto_bukti',
        'status',
        'catatan_admin',
        'jumlah_refund',
        'status_refund',
        'metode_refund',
        'bukti_refund',
        'tanggal_refund',
    ];

    protected $casts = [
        'foto_bukti' => 'array',
        'jumlah_refund' => 'decimal:2',
        'tanggal_refund' => 'datetime',
    ];

    public function transaksi()
    {
        return $this->belongsTo(Transaksi::class, 'id_transaksi', 'id_transaksi');
    }

    public function customer()
    {
        return $this->belongsTo(Pengguna::class, 'id_customer', 'id_pengguna');
    }
}
