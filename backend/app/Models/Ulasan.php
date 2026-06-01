<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ulasan extends Model
{
    protected $table = 'ulasan';
    protected $primaryKey = 'id_ulasan';

    protected $fillable = [
        'id_transaksi',
        'id_pengguna',
        'id_barang',
        'rating',
        'edited_count',
        'edited_at',
        'komentar',
        'foto_ulasan',
    ];

    protected $casts = [
        'rating' => 'integer',
        'foto_ulasan' => 'array',
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'id_pengguna', 'id_pengguna');
    }

    public function barang()
    {
        return $this->belongsTo(Barang::class, 'id_barang', 'id_barang');
    }

    public function transaksi()
    {
        return $this->belongsTo(Transaksi::class, 'id_transaksi', 'id_transaksi');
    }


    public function detailTransaksi()
    {
        return $this->hasOne(DetailTransaksi::class, 'id_barang', 'id_barang')
            ->where('id_transaksi', $this->id_transaksi);
    }
}
