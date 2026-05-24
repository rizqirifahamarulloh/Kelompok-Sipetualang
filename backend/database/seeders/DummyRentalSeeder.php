<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pengguna;
use App\Models\Barang;
use App\Models\Kategori;
use App\Models\Transaksi;
use App\Models\DetailTransaksi;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Support\Facades\Hash;

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

        // 2. CUSTOMER
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

        $perental = Pengguna::updateOrCreate(
            ['email' => 'perental@test.com'],
            [
                'nama' => 'Budi Perental',
                'alamat' => 'Jl. Perental No. 1',
                'kota' => 'Jakarta',
                'password' => Hash::make('password'),
                'no_telp' => '081234567891',
                'peran_pengguna' => 'customer',
            ]
        );

        // 3. KATEGORI
        $kategori1 = Kategori::first();
        if (!$kategori1) {
            $kategori1 = Kategori::create(['nama_kategori' => 'Alat Camping']);
        }

        // 4. BARANG RENTAL (Perental menyewakan barang)
        $barang1 = Barang::updateOrCreate(
            [
                'id_pemilik' => $perental->id_pengguna,
                'nama_barang' => 'Tenda Dome 4 Orang'
            ],
            [
                'id_kategori' => $kategori1->id_kategori,
                'deskripsi' => 'Tenda dome anti air, cocok untuk camping',
                'harga_sewa' => 75000,
                'jumlah_stok' => 5,
                'status_barang' => 'tersedia',
                'status_approval' => 'disetujui',
            ]
        );

        $barang2 = Barang::updateOrCreate(
            [
                'id_pemilik' => $perental->id_pengguna,
                'nama_barang' => 'Kompor Portable'
            ],
            [
                'id_kategori' => $kategori1->id_kategori,
                'deskripsi' => 'Kompor camping portable + gas',
                'harga_sewa' => 35000,
                'jumlah_stok' => 4,
                'status_barang' => 'tersedia',
                'status_approval' => 'disetujui',
            ]
        );

        $barang3 = Barang::updateOrCreate(
            [
                'id_pemilik' => $perental->id_pengguna,
                'nama_barang' => 'Sleeping Bag'
            ],
            [
                'id_kategori' => $kategori1->id_kategori,
                'deskripsi' => 'Sleeping bag tahan dingin',
                'harga_sewa' => 30000,
                'jumlah_stok' => 6,
                'status_barang' => 'tersedia',
                'status_approval' => 'disetujui',
            ]
        );

        // 5. TRANSAKSI RENTAL (Penyewa menyewa dari Perental) - VERSI UPDATE

        // Transaksi 1: Penyewa rental Tenda
        $transaksi1 = Transaksi::create([
            'id_penyewa' => $penyewa->id_pengguna,
            'id_pemilik' => $perental->id_pengguna,
            'id_barang' => $barang1->id_barang,
            'nama_barang' => $barang1->nama_barang,
            'jumlah' => 1,
            'harga_per_hari' => $barang1->harga_sewa,
            'tanggal_mulai' => '2024-12-25',
            'tanggal_selesai' => '2024-12-27',
            'total_hari' => 3,
            'total_biaya' => 225000,
            'nominal_deposit' => 100000,
            'fee_admin' => 45000,      // 20%
            'pendapatan_pemilik' => 180000, // 80%
            'metode_pengiriman' => 'pickup',
            'status_sewa' => 'sedang_disewa',
            'status_pembayaran' => 'sukses',
        ]);

        DetailTransaksi::create([
            'id_transaksi' => $transaksi1->id_transaksi,
            'id_barang' => $barang1->id_barang,
            'jumlah_pinjam' => 1,
            'subtotal' => 225000,
        ]);

        // Transaksi 2: Penyewa rental Kompor
        $transaksi2 = Transaksi::create([
            'id_penyewa' => $penyewa->id_pengguna,
            'id_pemilik' => $perental->id_pengguna,
            'id_barang' => $barang2->id_barang,
            'nama_barang' => $barang2->nama_barang,
            'jumlah' => 1,
            'harga_per_hari' => $barang2->harga_sewa,
            'tanggal_mulai' => '2024-12-28',
            'tanggal_selesai' => '2024-12-30',
            'total_hari' => 3,
            'total_biaya' => 105000,
            'nominal_deposit' => 50000,
            'fee_admin' => 21000,
            'pendapatan_pemilik' => 84000,
            'metode_pengiriman' => 'pickup',
            'status_sewa' => 'dibayar',
            'status_pembayaran' => 'sukses',
        ]);

        DetailTransaksi::create([
            'id_transaksi' => $transaksi2->id_transaksi,
            'id_barang' => $barang2->id_barang,
            'jumlah_pinjam' => 1,
            'subtotal' => 105000,
        ]);

        // Transaksi 3: Penyewa rental Sleeping Bag
        $transaksi3 = Transaksi::create([
            'id_penyewa' => $penyewa->id_pengguna,
            'id_pemilik' => $perental->id_pengguna,
            'id_barang' => $barang3->id_barang,
            'nama_barang' => $barang3->nama_barang,
            'jumlah' => 1,
            'harga_per_hari' => $barang3->harga_sewa,
            'tanggal_mulai' => '2025-01-05',
            'tanggal_selesai' => '2025-01-08',
            'total_hari' => 4,
            'total_biaya' => 120000,
            'nominal_deposit' => 60000,
            'fee_admin' => 24000,
            'pendapatan_pemilik' => 96000,
            'metode_pengiriman' => 'pickup',
            'status_sewa' => 'menunggu_pembayaran',
            'status_pembayaran' => 'pending',
        ]);

        DetailTransaksi::create([
            'id_transaksi' => $transaksi3->id_transaksi,
            'id_barang' => $barang3->id_barang,
            'jumlah_pinjam' => 1,
            'subtotal' => 120000,
        ]);

        // 6. CHAT ANTAR CUSTOMER (Penyewa <-> Perental)
        $chat = Conversation::updateOrCreate(
            [
                'id_user_a' => min($penyewa->id_pengguna, $perental->id_pengguna),
                'id_user_b' => max($penyewa->id_pengguna, $perental->id_pengguna),
            ],
            ['last_message_at' => now()]
        );

        // Pesan dari Penyewa ke Perental
        Message::create([
            'id_conversation' => $chat->id_conversation,
            'id_sender' => $penyewa->id_pengguna,
            'message' => 'Halo Bang, tendanya masih tersedia untuk tanggal 25-27 Desember?',
            'is_read' => true,
        ]);

        // Balasan dari Perental
        Message::create([
            'id_conversation' => $chat->id_conversation,
            'id_sender' => $perental->id_pengguna,
            'message' => 'Masih tersedia. Mau berapa unit?',
            'is_read' => true,
        ]);

        // Pesan lanjutan dari Penyewa
        Message::create([
            'id_conversation' => $chat->id_conversation,
            'id_sender' => $penyewa->id_pengguna,
            'message' => '1 unit aja. Apakah bisa antar ke daerah Bandung?',
            'is_read' => false,
        ]);

        $this->command->info('✅ Dummy rental berhasil dibuat!');
        $this->command->info('📊 Customer: penyewa@test.com (Budi Penyewa) & perental@test.com (Budi Perental)');
        $this->command->info('📦 Barang: 3 item dari Perental');
        $this->command->info('💰 Transaksi: 3 transaksi dari Penyewa');
        $this->command->info('💬 Chat: 3 pesan antara Penyewa dan Perental');
    }
}
