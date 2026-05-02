<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('transaksi', function (Blueprint $table) {
            $table->id('id_transaksi');
            $table->unsignedBigInteger('id_penyewa');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->decimal('total_biaya', 10, 2);
            $table->decimal('nominal_deposit', 10, 2);
            $table->enum('status_sewa', ['menunggu_pembayaran', 'dibayar', 'sedang_disewa', 'selesai', 'dibatalkan'])->default('menunggu_pembayaran');
            $table->date('tanggal_kembali_real')->nullable();
            $table->timestamps();

            $table->foreign('id_penyewa')->references('id_pengguna')->on('pengguna')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('transaksi');
    }
};
