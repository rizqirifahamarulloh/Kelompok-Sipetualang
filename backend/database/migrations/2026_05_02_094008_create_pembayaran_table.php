<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('pembayaran', function (Blueprint $table) {
            $table->id('id_pembayaran');
            $table->unsignedBigInteger('id_transaksi');
            $table->enum('metode_bayar', ['transfer_bank', 'e_wallet', 'tunai']);
            $table->enum('status_bayar', ['pending', 'sukses', 'gagal'])->default('pending');
            $table->string('bukti_bayar', 255)->nullable();
            $table->timestamp('tanggal_bayar')->nullable();
            $table->timestamps();

            $table->foreign('id_transaksi')->references('id_transaksi')->on('transaksi')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('pembayaran');
    }
};
