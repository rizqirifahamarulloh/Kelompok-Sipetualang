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
        'alamat',
        'kota',
        'password',
        'no_telp',
        'peran_pengguna',
        'google_id',
        'profile_photo',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        // No specific casts needed
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
    public function isCustomer()
    {
        return $this->peran_pengguna === 'customer';
    }

    public function isAdmin()
    {
        return $this->peran_pengguna === 'admin';
    }
}
