<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('voucher_usages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_voucher');
            $table->unsignedBigInteger('id_pengguna');
            $table->unsignedBigInteger('id_transaksi')->nullable();
            $table->decimal('diskon_dapat', 15, 2);
            $table->decimal('total_setelah_diskon', 15, 2);
            $table->timestamps();

            $table->foreign('id_voucher')->references('id')->on('vouchers')->onDelete('cascade');
            $table->foreign('id_pengguna')->references('id_pengguna')->on('pengguna')->onDelete('cascade');
            $table->foreign('id_transaksi')->references('id_transaksi')->on('transaksi')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voucher_usages');
    }
};
