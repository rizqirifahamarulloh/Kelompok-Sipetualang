<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetailTransaksi extends Model
{
    protected $table = 'detail_transaksi';
    protected $primaryKey = 'id_detail';
    protected $fillable = [
        'id_transaksi', 'id_barang', 'jumlah_pinjam', 'subtotal'
    ];
}
