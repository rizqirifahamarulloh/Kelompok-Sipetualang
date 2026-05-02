<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pengguna;
use Illuminate\Support\Facades\Hash;

class PenggunaSeeder extends Seeder
{
    public function run()
    {
        // Admin
        Pengguna::updateOrCreate(
            ['email' => 'admin@sipetualang.com'],
            [
                'nama' => 'Admin SiPetualang',
                'password' => Hash::make('password'),
                'peran_pengguna' => 'admin',
                'verifikasi_ktp' => true,
                'no_telp' => '081234567890',
                'created_at' => now()
            ]
        );

        // Test Penyewa
        Pengguna::updateOrCreate(
            ['email' => 'penyewa@test.com'],
            [
                'nama' => 'Budi Penyewa',
                'password' => Hash::make('password'),
                'peran_pengguna' => 'penyewa',
                'verifikasi_ktp' => true,
                'no_telp' => '081234567891',
                'created_at' => now()
            ]
        );

        // Test Pemilik
        Pengguna::updateOrCreate(
            ['email' => 'pemilik@test.com'],
            [
                'nama' => 'Siti Pemilik',
                'password' => Hash::make('password'),
                'peran_pengguna' => 'pemilik',
                'verifikasi_ktp' => false,
                'no_telp' => '081234567892',
                'created_at' => now()
            ]
        );
    }
}
