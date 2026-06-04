<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FotoBarang extends Model
{
    protected $table = 'foto_barang';
    protected $primaryKey = 'id_foto';

    protected $fillable = [
        'id_barang',
        'foto_path',
        'urutan',
    ];

    public function barang()
    {
        return $this->belongsTo(Barang::class, 'id_barang', 'id_barang');
    }
}
