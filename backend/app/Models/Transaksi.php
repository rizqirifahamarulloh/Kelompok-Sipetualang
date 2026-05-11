<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaksi extends Model
{
    protected $table = 'transaksi';
    protected $primaryKey = 'id_transaksi';
    protected $fillable = [
        'id_penyewa', 'tanggal_mulai', 'tanggal_selesai', 
        'total_biaya', 'nominal_deposit', 'status_sewa', 'tanggal_kembali_real'
    ];

    public function penyewa() {
        return $this->belongsTo(Pengguna::class, 'id_penyewa', 'id_pengguna');
    }
}
