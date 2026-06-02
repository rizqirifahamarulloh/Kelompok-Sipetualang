<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ulasan', function (Blueprint $table) {
            // Drop unique lama (1 transaksi = 1 ulasan)
            $table->dropUnique(['id_transaksi']);

            // Buat composite unique (1 transaksi + 1 barang = 1 ulasan)
            $table->unique(['id_transaksi', 'id_barang'], 'ulasan_transaksi_barang_unique');
        });
    }

    public function down(): void
    {
        Schema::table('ulasan', function (Blueprint $table) {
            $table->dropUnique('ulasan_transaksi_barang_unique');
            $table->unique('id_transaksi');
        });
    }
};
