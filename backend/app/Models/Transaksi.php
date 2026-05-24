<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaksi extends Model
{
    protected $table = 'transaksi';
    protected $primaryKey = 'id_transaksi';
    public $timestamps = true;

    protected $fillable = [
        'id_penyewa', 'id_pemilik', 'id_barang', 'nama_barang',
        'jumlah', 'harga_per_hari', 'tanggal_mulai', 'tanggal_selesai',
        'total_hari', 'total_biaya', 'fee_admin', 'pendapatan_pemilik',
        'metode_pengiriman', 'alamat_pengiriman', 'biaya_pengiriman',
        'status_pembayaran', 'status_sewa', 'midtrans_order_id', 'snap_token'
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
    ];

    public function penyewa()
    {
        return $this->belongsTo(Pengguna::class, 'id_penyewa', 'id_pengguna');
    }

    public function pemilik()
    {
        return $this->belongsTo(Pengguna::class, 'id_pemilik', 'id_pengguna');
    }

    public function barang()
    {
        return $this->belongsTo(Barang::class, 'id_barang', 'id_barang');
    }
}
