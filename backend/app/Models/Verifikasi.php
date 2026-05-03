<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Verifikasi extends Model
{
    use HasFactory;

    protected $table = 'verifikasi';
    protected $primaryKey = 'id_verifikasi';
    public $timestamps = false;

    protected $fillable = [
        'id_pengguna',
        'token',
        'jenis_verifikasi',
        'kadaluarsa',
        'foto_ktp',
        'foto_selfie_ktp',
        'status_verifikasi',
        'tanggal_pengajuan',
        'catatan_admin',
    ];

    protected $casts = [
        'tanggal_pengajuan' => 'datetime',
        'kadaluarsa' => 'datetime',
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'id_pengguna', 'id_pengguna');
    }
}
