<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pengguna;
use App\Models\Barang;
use App\Models\Kategori;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;

class DummyRentalSeeder extends Seeder
{
    public function run()
    {
        // 1. ADMIN
        $admin = Pengguna::updateOrCreate(
            ['email' => 'admin@sipetualang.com'],
            [
                'nama' => 'Admin SiPetualang',
                'password' => Hash::make('password'),
                'alamat' => 'Jl. Admin No. 1',
                'kota' => 'Jakarta',
                'no_telp' => '081234567890',
                'peran_pengguna' => 'admin',
            ]
        );

        // 2. CUSTOMER (Penyewa) — tanpa transaksi, data kosong
        $penyewa = Pengguna::updateOrCreate(
            ['email' => 'penyewa@test.com'],
            [
                'nama' => 'Budi Penyewa',
                'alamat' => 'Jl. Penyewa No. 2',
                'kota' => 'Bandung',
                'password' => Hash::make('password'),
                'no_telp' => '081234567891',
                'peran_pengguna' => 'customer',
            ]
        );

        // 3. PERENTAL — sudah aktif rental
        $perental = Pengguna::updateOrCreate(
            ['email' => 'perental@test.com'],
            [
                'nama' => 'Budi Perental',
                'alamat' => 'Jl. Perental No. 1',
                'kota' => 'Jakarta',
                'password' => Hash::make('password'),
                'no_telp' => '081234567891',
                'peran_pengguna' => 'perental',
                'rental' => 'true',
            ]
        );

        // 4. KATEGORI
        $kategori1 = Kategori::first();
        if (!$kategori1) {
            $kategori1 = Kategori::create(['nama_kategori' => 'Alat Camping']);
        }

        // 5. BARANG RENTAL — Hanya 3 item, tanpa transaksi/order

        // Copy gambar barang dari frontend assets ke storage
        $assetsPath = base_path('../frontend/src/assets/sewaalat');
        $storagePath = storage_path('app/public/barang');
        if (!File::isDirectory($storagePath)) {
            File::makeDirectory($storagePath, 0755, true);
        }

        $imageMap = [
            'tenda-dome-4-orang.png' => 'barang/tenda-dome-4-orang.png',
            'kompor-portable.png' => 'barang/kompor-portable.png',
            'sleeping-bag.png' => 'barang/sleeping-bag.png',
        ];

        foreach ($imageMap as $filename => $destPath) {
            $source = $assetsPath . '/' . $filename;
            $dest = storage_path('app/public/' . $destPath);
            if (File::exists($source)) {
                File::copy($source, $dest);
            }
        }

        Barang::updateOrCreate(
            [
                'id_pemilik' => $perental->id_pengguna,
                'nama_barang' => 'Tenda Dome 4 Orang'
            ],
            [
                'id_kategori' => $kategori1->id_kategori,
                'deskripsi' => 'Tenda dome anti air, cocok untuk camping keluarga. Kapasitas 4 orang dengan ventilasi udara yang baik.',
                'harga_sewa' => 75000,
                'nominal_deposit' => 50000,
                'jumlah_stok' => 5,
                'status_barang' => 'tersedia',
                'status_approval' => 'disetujui',
                'foto_barang' => 'barang/tenda-dome-4-orang.png',
            ]
        );

        Barang::updateOrCreate(
            [
                'id_pemilik' => $perental->id_pengguna,
                'nama_barang' => 'Kompor Portable'
            ],
            [
                'id_kategori' => $kategori1->id_kategori,
                'deskripsi' => 'Kompor camping portable dengan gas kaleng. Ringan dan mudah dibawa ke mana saja.',
                'harga_sewa' => 35000,
                'nominal_deposit' => 20000,
                'jumlah_stok' => 4,
                'status_barang' => 'tersedia',
                'status_approval' => 'disetujui',
                'foto_barang' => 'barang/kompor-portable.png',
            ]
        );

        Barang::updateOrCreate(
            [
                'id_pemilik' => $perental->id_pengguna,
                'nama_barang' => 'Sleeping Bag'
            ],
            [
                'id_kategori' => $kategori1->id_kategori,
                'deskripsi' => 'Sleeping bag tahan dingin hingga suhu 5°C. Cocok untuk pendakian gunung.',
                'harga_sewa' => 30000,
                'nominal_deposit' => 15000,
                'jumlah_stok' => 6,
                'status_barang' => 'tersedia',
                'status_approval' => 'disetujui',
                'foto_barang' => 'barang/sleeping-bag.png',
            ]
        );

        // ===== TIDAK ADA TRANSAKSI, CHAT, ULASAN, PENGEMBALIAN =====
        // Data customer (penyewa) bersih — belum ada aktivitas apapun
        // Perental hanya punya 3 barang yang siap disewakan

        $this->command->info('✅ Seed berhasil! Data bersih.');
        $this->command->info('👤 Admin: admin@sipetualang.com | password');
        $this->command->info('👤 Customer: penyewa@test.com | password');
        $this->command->info('👤 Perental: perental@test.com | password');
        $this->command->info('📦 Barang: 3 item (Tenda, Kompor, Sleeping Bag) — belum ada order');
        $this->command->info('📊 Transaksi: 0 | Ulasan: 0 | Chat: 0');
    }
}
