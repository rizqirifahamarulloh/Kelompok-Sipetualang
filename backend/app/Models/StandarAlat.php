<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StandarAlat extends Model
{
    protected $table = 'standar_alat';
    protected $primaryKey = 'id_standar';
    public $timestamps = false;
    protected $fillable = ['id_destinasi', 'id_barang'];

    public function barang() {
        return $this->belongsTo(Barang::class, 'id_barang', 'id_barang');
    }

    public function jenisDestinasi() {
        return $this->belongsTo(JenisDestinasi::class, 'id_destinasi', 'id_destinasi');
    }
}
