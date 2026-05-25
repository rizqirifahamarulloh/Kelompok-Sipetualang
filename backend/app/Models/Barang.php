<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Barang extends Model
{
    protected $table = 'barang';
    protected $primaryKey = 'id_barang';

    // Matikan timestamps karena tabel tidak punya
    public $timestamps = false;

    protected $fillable = [
        'id_pemilik', 'id_kategori', 'nama_barang', 'deskripsi',
        'foto_barang', 'harga_sewa', 'jumlah_stok', 'status_barang',
        'status_approval', 'butuh_verifikasi'
    ];

    public function pemilik()
    {
        return $this->belongsTo(Pengguna::class, 'id_pemilik', 'id_pengguna');
    }

    public function kategori()
    {
        return $this->belongsTo(Kategori::class, 'id_kategori', 'id_kategori');
    }
}
