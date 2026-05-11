<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Barang extends Model
{
    protected $table = 'barang';
    protected $primaryKey = 'id_barang';
    protected $fillable = [
        'id_pemilik', 'id_kategori', 'nama_barang', 'harga_sewa', 
        'jumlah_stok', 'status_barang', 'status_persetujuan'
    ];

    public function pemilik() {
        return $this->belongsTo(Pengguna::class, 'id_pemilik', 'id_pengguna');
    }

    public function kategori() {
        return $this->belongsTo(Kategori::class, 'id_kategori', 'id_kategori');
    }
}
