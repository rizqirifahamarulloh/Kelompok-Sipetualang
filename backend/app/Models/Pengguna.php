<?php

namespace App\Models;

use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Pengguna extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $table = 'pengguna';
    protected $primaryKey = 'id_pengguna';
    public $timestamps = false;

    protected $fillable = [
        'nama',
        'email',
        'password',
        'no_telp',
        'peran_pengguna',
        'foto_ktp',
        'foto_swafoto',
        'verifikasi_ktp',
        'google_id'
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'verifikasi_ktp' => 'boolean',
        'created_at' => 'datetime',
    ];

    // JWT Methods
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'id_pengguna' => $this->id_pengguna,
            'nama' => $this->nama,
            'email' => $this->email,
            'peran' => $this->peran_pengguna,
        ];
    }

    // Role check methods
    public function isPemilik()
    {
        return $this->peran_pengguna === 'pemilik';
    }

    public function isPenyewa()
    {
        return $this->peran_pengguna === 'penyewa';
    }

    public function isAdmin()
    {
        return $this->peran_pengguna === 'admin';
    }
}
